import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { verifyToken } from '@/app/lib/crypto'
import { SYSTEM_PROMPT, MODEL, MAX_TOKENS } from '@/app/lib/constants'

export const runtime = 'nodejs'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

async function authenticate(req: NextRequest): Promise<boolean> {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return false

  const token = authHeader.slice(7)
  const pinHash = process.env.APP_PIN_HASH
  const secret = process.env.SESSION_SECRET
  if (!pinHash || !secret) return false

  return verifyToken(token, pinHash, secret)
}

export async function POST(req: NextRequest) {
  const isAuthed = await authenticate(req)
  if (!isAuthed) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const { messages, structuredPrompt } = (await req.json()) as {
      messages?: ChatMessage[]
      structuredPrompt?: string
    }

    if (!structuredPrompt) {
      return new Response(JSON.stringify({ error: 'No prompt provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const client = new Anthropic({ apiKey })

    const conversationMessages: ChatMessage[] = [
      ...(messages || []).slice(-20),
      { role: 'user' as const, content: structuredPrompt },
    ]

    const stream = await client.messages.stream({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: conversationMessages,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              const data = JSON.stringify({ type: 'delta', text: event.delta.text })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`))
          controller.close()
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Stream error'
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', error: msg })}\n\n`)
          )
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal error'
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
