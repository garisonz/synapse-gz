"use client"

import { useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileDropZone } from "./FileDropZone"
import { CsvPreview } from "./CsvPreview"
import { NotebookCell } from "./NotebookCell"
import type { NotebookCellData } from "@/hooks/useToolboxState"

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface NotebookPanelProps {
  file: File | null
  parsedRows: string[][]
  cells: NotebookCellData[]
  onFileChange: (file: File) => void
  onRemove: () => void
  onDeleteCell: (id: string) => void
}

export function NotebookPanel({
  file,
  parsedRows,
  cells,
  onFileChange,
  onRemove,
  onDeleteCell,
}: NotebookPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (cells.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [cells.length])

  if (!file) {
    return <FileDropZone onFileChange={onFileChange} />
  }

  const columns = parsedRows.length > 0 ? parsedRows[0] : []
  const rowCount = Math.max(0, parsedRows.length - 1)

  return (
    <ScrollArea className="flex-1 h-full">
      <div className="p-5 flex flex-col gap-4">
        {/* Data cell */}
        <div
          className="rounded-xl border p-4 flex flex-col gap-4"
          style={{
            background: "var(--bg-secondary)",
            borderColor: "var(--border)",
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "rgba(16, 185, 129, 0.15)" }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth="1.5"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <div className="min-w-0">
                <p
                  className="text-sm font-medium truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {file.name}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {formatFileSize(file.size)} · {columns.length} columns ·{" "}
                  {rowCount} rows
                </p>
              </div>
            </div>
            <button
              className="text-xs px-2.5 py-1 rounded-md border shrink-0 transition-colors"
              style={{
                color: "var(--text-secondary)",
                borderColor: "var(--border)",
                background: "transparent",
              }}
              onClick={onRemove}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--surface-hover)"
                e.currentTarget.style.color = "#f87171"
                e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.3)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent"
                e.currentTarget.style.color = "var(--text-secondary)"
                e.currentTarget.style.borderColor = "var(--border)"
              }}
            >
              Remove
            </button>
          </div>
          <CsvPreview rows={parsedRows} />
        </div>

        {/* Cells */}
        {cells.map((cell, i) => (
          <NotebookCell
            key={cell.id}
            cell={cell}
            index={i + 1}
            onDelete={onDeleteCell}
          />
        ))}

        {/* Empty hint */}
        {cells.length === 0 && (
          <p
            className="text-sm text-center py-8"
            style={{ color: "var(--text-muted)" }}
          >
            Configure settings in the sidebar and click Run to add analysis
            cells here.
          </p>
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  )
}
