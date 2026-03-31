"use client"

import { useState, useRef } from "react"
import { CsvPreview } from "./CsvPreview"

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface UploadPanelProps {
  file: File | null
  parsedRows: string[][]
  onFileChange: (file: File) => void
  onRemove: () => void
}

export function UploadPanel({ file, parsedRows, onFileChange, onRemove }: UploadPanelProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault() }
  const handleDragEnter = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false) }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f && /\.(csv|xlsx|xls)$/i.test(f.name)) onFileChange(f)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) onFileChange(f)
  }

  if (!file) {
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

  const columns = parsedRows.length > 0 ? parsedRows[0] : []
  const rowCount = Math.max(0, parsedRows.length - 1)

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: "var(--bg-primary)" }}>
      <div className="p-5 flex flex-col gap-4 max-w-3xl">
        <div
          className="rounded-xl p-4 flex flex-col gap-4"
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "rgba(59,130,246,0.1)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                  {file.name}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {formatFileSize(file.size)} · {columns.length} columns · {rowCount.toLocaleString()} rows
                </p>
              </div>
            </div>
            <button
              className="text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{ color: "var(--text-muted)", background: "var(--surface-active)", border: "1px solid var(--border)" }}
              onClick={onRemove}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#ef4444"
                e.currentTarget.style.background = "rgba(239,68,68,0.06)"
                e.currentTarget.style.borderColor = "rgba(239,68,68,0.2)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-muted)"
                e.currentTarget.style.background = "var(--surface-active)"
                e.currentTarget.style.borderColor = "var(--border)"
              }}
            >
              Remove
            </button>
          </div>
          <CsvPreview rows={parsedRows} />
        </div>

        <label
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg cursor-pointer transition-all self-start text-sm"
          style={{ border: "1px dashed var(--border)", color: "var(--text-muted)", background: "transparent" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--surface-hover)"
            e.currentTarget.style.color = "var(--text-secondary)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent"
            e.currentTarget.style.color = "var(--text-muted)"
          }}
        >
          <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleInputChange} />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Upload a different file
        </label>
      </div>
    </div>
  )
}
