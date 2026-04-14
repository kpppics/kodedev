'use client'
import { useRef, useState, type DragEvent } from 'react'

interface Props {
  onFile: (file: File) => void
  accept?: string
  hint?: string
}

export function CsvDropzone({ onFile, accept = '.csv,text/csv', hint = 'CSV columns: identifier, cost, title, moq' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)

  const handle = (f: File) => onFile(f)

  return (
    <div
      className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors"
      style={{
        borderColor: drag ? 'var(--color-primary)' : 'var(--color-outline-variant)',
        background: drag ? 'var(--color-primary-container)' : 'transparent',
      }}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e: DragEvent) => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e: DragEvent) => {
        e.preventDefault(); setDrag(false)
        const f = e.dataTransfer.files[0]
        if (f) handle(f)
      }}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 36, color: 'var(--color-primary)' }}>upload_file</span>
      <p className="mt-2 font-semibold">Drop CSV here or tap to choose</p>
      <p className="text-xs mt-1" style={{ color: 'var(--color-on-surface-variant)' }}>{hint}</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) handle(f) }}
      />
    </div>
  )
}
