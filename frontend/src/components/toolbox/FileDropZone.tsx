"use client"

import { useState, useRef } from "react"

interface FileDropZoneProps {
  onFileChange: (file: File) => void
}

export function FileDropZone({ onFileChange }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault() }
  const handleDragEnter = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && /\.(csv|xlsx|xls)$/i.test(file.name)) onFileChange(file)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFileChange(file)
  }

  return (
    <div className="flex-1 flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
      <label
        className="flex flex-col items-center justify-center gap-4 cursor-pointer transition-all"
        style={{
          width: "360px",
          height: "220px",
          borderRadius: "16px",
          border: isDragging ? "2px solid #3b82f6" : "2px dashed var(--border)",
          background: isDragging ? "rgba(59,130,246,0.04)" : "var(--bg-secondary)",
          color: isDragging ? "#3b82f6" : "var(--text-secondary)",
        }}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleInputChange} />

        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all"
          style={{ background: isDragging ? "rgba(59,130,246,0.12)" : "var(--surface-active)" }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke={isDragging ? "#3b82f6" : "var(--text-muted)"}
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="text-sm font-medium">
            {isDragging ? "Drop to upload" : "Drop a file or browse"}
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            CSV, XLSX or XLS · <span style={{ color: "#3b82f6" }}>browse files</span>
          </span>
        </div>
      </label>
    </div>
  )
}
