import Anthropic from '@anthropic-ai/sdk'
import { THRIFT_PROMPT } from './prompt'
import type { ThriftIdentification } from './types'

let client: Anthropic | null = null
function anthropic(): Anthropic {
  if (!client) {
    const key = process.env.ANTHROPIC_API_KEY
    if (!key) throw new Error('ANTHROPIC_API_KEY missing')
    client = new Anthropic({ apiKey: key })
  }
  return client
}

export async function identifyFromImage(imageBase64: string, mediaType: string): Promise<ThriftIdentification> {
  const model = process.env.VISION_MODEL || 'claude-sonnet-4-6'
  const res = await anthropic().messages.create({
    model,
    max_tokens: 800,
    temperature: 0,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
            data: imageBase64,
          },
        },
        { type: 'text', text: THRIFT_PROMPT },
      ],
    }],
  })
  const text = res.content
    .filter((c): c is { type: 'text'; text: string } => c.type === 'text')
    .map(c => c.text)
    .join('')
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
