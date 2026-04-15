import { THRIFT_PROMPT } from './prompt'
import type { ThriftIdentification } from './types'

// Groq vision API (OpenAI-compatible). Model: llama-3.2-90b-vision-preview or llama-3.2-11b-vision-preview
const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions'

export async function identifyFromImage(imageBase64: string, mediaType: string): Promise<ThriftIdentification> {
  const key = process.env.GROQ_API_KEY
  if (!key) throw new Error('GROQ_API_KEY missing')
  const model = process.env.VISION_MODEL || 'llama-3.2-90b-vision-preview'

  const res = await fetch(GROQ_API, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      max_tokens: 800,
      temperature: 0,
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${mediaType};base64,${imageBase64}` } },
          { type: 'text', text: THRIFT_PROMPT },
        ],
      }],
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq vision error ${res.status}: ${err.slice(0, 200)}`)
  }
  const data = await res.json() as { choices: Array<{ message: { content: string } }> }
  const text = data.choices?.[0]?.message?.content || ''
  const jsonStart = text.indexOf('{')
  const jsonEnd = text.lastIndexOf('}')
  if (jsonStart < 0 || jsonEnd < 0) throw new Error('Vision response lacked JSON: ' + text.slice(0, 200))
  const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1)) as ThriftIdentification
  return {
    title: parsed.title || 'Unknown item',
    brand: parsed.brand ?? null,
    model: parsed.model ?? null,
    category: parsed.category || 'other',
    searchTerms: Array.isArray(parsed.searchTerms) ? parsed.searchTerms.slice(0, 5) : [],
    visibleText: Array.isArray(parsed.visibleText) ? parsed.visibleText : [],
    confidence: (parsed.confidence === 'high' || parsed.confidence === 'medium' || parsed.confidence === 'low') ? parsed.confidence : 'low',
  }
}
