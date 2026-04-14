import { analyze } from '@/app/lib/analyze'
import { parseBulkCsv, type BulkRow } from '@/app/lib/csv'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function POST(req: Request) {
  const form = await req.formData()
  const file = form.get('file')
  const vatRegisteredRaw = form.get('vatRegistered')
  const vatRegistered = vatRegisteredRaw === 'true'

  let rows: BulkRow[] = []
  if (file instanceof File) {
    const text = await file.text()
    rows = parseBulkCsv(text)
  }
  if (rows.length === 0) {
    return new Response('event: error\ndata: {"message":"no rows parsed"}\n\n', {
      headers: { 'Content-Type': 'text/event-stream' },
    })
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`))
      }
      send('start', { total: rows.length })
      let best: Awaited<ReturnType<typeof analyze>> | null = null
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        try {
          const combos: Array<{ src: 'amazon' | 'ebay' | 'retail'; tgt: 'amazon' | 'ebay' }> = [
            { src: 'retail', tgt: 'amazon' },
            { src: 'retail', tgt: 'ebay' },
          ]
          const results = await Promise.all(combos.map(c =>
            analyze({ identifier: row.identifier, sourceCost: row.cost, sourceProvider: c.src, targetProvider: c.tgt, vatRegistered }).catch(() => null),
          ))
          best = results
            .filter((r): r is Awaited<ReturnType<typeof analyze>> => !!r && r.targetPrice > 0)
            .sort((a, b) => b.profit - a.profit)[0] || null
          send('row', { index: i, identifier: row.identifier, cost: row.cost, title: row.title, best })
        } catch (e) {
          send('error', { index: i, identifier: row.identifier, message: String((e as Error).message || e) })
        }
        // Respect SP-API rate limits (~1 req/s)
        if (i < rows.length - 1) await new Promise(r => setTimeout(r, 400))
      }
      send('done', { processed: rows.length })
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
