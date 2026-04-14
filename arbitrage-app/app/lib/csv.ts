import Papa from 'papaparse'

export interface BulkRow {
  identifier: string
  cost: number
  title?: string
  moq?: number
}

export function parseBulkCsv(text: string): BulkRow[] {
  const parsed = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true })
  return (parsed.data || []).map(r => ({
    identifier: (r.identifier || r.upc || r.asin || r.ean || '').trim(),
    cost: parseFloat((r.cost || r.price || '0').replace(/[^0-9.]/g, '')) || 0,
    title: r.title || r.name || undefined,
    moq: r.moq ? parseInt(r.moq, 10) : undefined,
  })).filter(r => r.identifier && r.cost > 0)
}

export function toCsv<T extends Record<string, unknown>>(rows: T[]): string {
  return Papa.unparse(rows)
}
