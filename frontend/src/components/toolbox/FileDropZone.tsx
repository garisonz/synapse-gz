"use client"

import { useState, useRef } from "react"

interface FileDropZoneProps {
  onFileChange: (file: File) => void
}

export function FileDropZone({ onFileChange }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith(".csv")) {
      onFileChange(file)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFileChange(file)
  }

  return (
    <div
      className="flex-1 flex items-center justify-center"
      style={{ background: "var(--bg-primary)" }}
    >
      <label
        className="flex flex-col items-center justify-center gap-3 w-80 h-48 rounded-xl cursor-pointer transition-all"
        style={{
          border: isDragging
            ? "2px solid var(--text-primary)"
            : "2px dashed var(--border)",
          background: isDragging ? "var(--surface-active)" : "transparent",
          color: isDragging ? "var(--text-primary)" : "var(--text-secondary)",
        }}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleInputChange}
        />
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          style={{ color: "var(--text-muted)" }}
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <div className="flex flex-col items-center gap-1">
          <span className="text-sm font-medium">Drag &amp; drop a CSV file</span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            or{" "}
            <span
              className="underline"
              style={{ color: "var(--text-secondary)" }}
            >
              browse files
            </span>
          </span>
        </div>
      </label>
    </div>
  )
}
