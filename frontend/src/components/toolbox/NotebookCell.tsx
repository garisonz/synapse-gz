"use client"

import { useState } from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { NotebookCellData } from "@/hooks/useToolboxState"

const MODE_ICONS: Record<string, React.ReactNode> = {
  eda: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="1" y="10" width="3" height="5" rx="0.5" />
      <rect x="6" y="6" width="3" height="9" rx="0.5" />
      <rect x="11" y="2" width="3" height="13" rx="0.5" />
    </svg>
  ),
  feature: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="8" cy="8" r="6" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  ),
  training: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <polyline points="1,13 5,9 9,11 13,5" />
      <circle cx="13" cy="5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  ),
  comparison: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="1" y="3" width="5" height="10" rx="0.5" />
      <rect x="10" y="3" width="5" height="10" rx="0.5" />
    </svg>
  ),
}

const MODE_LABELS: Record<string, string> = {
  eda: "Auto EDA",
  feature: "Feature Engineering",
  training: "Model Training",
  comparison: "Comparison",
}

interface NotebookCellProps {
  cell: NotebookCellData
  index: number
  onDelete: (id: string) => void
}

export function NotebookCell({ cell, index, onDelete }: NotebookCellProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <TooltipProvider>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div
          className="rounded-xl overflow-hidden border"
          style={{
            background: "var(--bg-secondary)",
            borderColor: "var(--border)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-2 px-3 py-2 min-w-0"
            style={{
              borderBottom: isOpen ? "1px solid var(--border)" : "none",
            }}
          >
            {/* Index */}
            <span
              className="font-mono text-xs px-1.5 py-0.5 rounded shrink-0"
              style={{
                background: "var(--surface-active)",
                color: "var(--text-muted)",
              }}
            >
              [{index}]
            </span>

            {/* Mode icon */}
            <span className="shrink-0" style={{ color: "var(--text-secondary)" }}>
              {MODE_ICONS[cell.mode]}
            </span>

            {/* Mode label */}
            <span
              className="text-xs font-medium shrink-0"
              style={{ color: "var(--text-secondary)" }}
            >
              {MODE_LABELS[cell.mode] ?? cell.mode}
            </span>

            {/* Config summary */}
            <span
              className="text-xs truncate flex-1 min-w-0"
              style={{ color: "var(--text-muted)" }}
            >
              {cell.configSummary}
            </span>

            {/* Status badge */}
            {cell.status === "running" && (
              <Badge
                className="shrink-0 text-[11px] px-2 py-0.5 flex items-center gap-1.5 border"
                style={{
                  background: "rgba(217, 119, 6, 0.15)",
                  color: "#fbbf24",
                  borderColor: "rgba(217, 119, 6, 0.3)",
                }}
              >
                <svg
                  className="animate-spin"
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Running
              </Badge>
            )}
            {cell.status === "complete" && (
              <Badge
                className="shrink-0 text-[11px] px-2 py-0.5 border"
                style={{
                  background: "rgba(16, 185, 129, 0.15)",
                  color: "#34d399",
                  borderColor: "rgba(16, 185, 129, 0.3)",
                }}
              >
                Done
              </Badge>
            )}
            {cell.status === "error" && (
              <Badge
                className="shrink-0 text-[11px] px-2 py-0.5 border"
                style={{
                  background: "rgba(239, 68, 68, 0.15)",
                  color: "#f87171",
                  borderColor: "rgba(239, 68, 68, 0.3)",
                }}
              >
                Error
              </Badge>
            )}

            {/* Timestamp */}
            <span
              className="font-mono text-[11px] shrink-0"
              style={{ color: "var(--text-muted)" }}
            >
              {cell.timestamp}
            </span>

            {/* Collapse/expand */}
            <CollapsibleTrigger asChild>
              <button
                className="shrink-0 p-0.5 rounded transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{
                    transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
                    transition: "transform 0.2s",
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </CollapsibleTrigger>

            {/* Delete */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="shrink-0 p-0.5 rounded transition-colors"
                  style={{ color: "var(--text-muted)" }}
                  onClick={() => onDelete(cell.id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#f87171"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--text-muted)"
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </TooltipTrigger>
              <TooltipContent>Delete cell</TooltipContent>
            </Tooltip>
          </div>

          {/* Body */}
          <CollapsibleContent>
            <div className="p-4">
              {cell.status === "running" ? (
                <div
                  className="flex flex-col items-center justify-center gap-3 py-8"
                  style={{ color: "var(--text-muted)" }}
                >
                  <svg
                    className="animate-spin"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  <span className="text-sm">
                    {MODE_LABELS[cell.mode] ?? cell.mode} Running...
                  </span>
                </div>
              ) : cell.status === "error" ? (
                <div
                  className="flex flex-col gap-2 py-4"
                  style={{ color: "#f87171" }}
                >
                  <div className="flex items-center gap-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span className="text-sm font-medium">Analysis failed</span>
                  </div>
                  {cell.errorMessage && (
                    <p
                      className="text-xs font-mono px-3 py-2 rounded"
                      style={{
                        background: "rgba(239, 68, 68, 0.08)",
                        color: "#f87171",
                      }}
                    >
                      {cell.errorMessage}
                    </p>
                  )}
                </div>
              ) : cell.status === "complete" ? (
                <div className="flex flex-col gap-4">
                  {/* Metrics */}
                  {cell.metrics && cell.metrics.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                        Analysis complete. Results ready.
                      </p>
                      <div className="flex gap-3 flex-wrap">
                        {cell.metrics.map((metric, i) => (
                          <Card
                            key={i}
                            className="px-4 py-3 flex flex-col gap-0.5 border"
                            style={{
                              background: "var(--surface-active)",
                              borderColor: "var(--border)",
                              minWidth: "90px",
                            }}
                          >
                            <span
                              className="text-[10px] uppercase tracking-widest font-semibold"
                              style={{ color: "var(--text-muted)" }}
                            >
                              {metric.label}
                            </span>
                            <span
                              className="text-xl font-bold"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {metric.value}
                            </span>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Plots */}
                  {cell.plots && cell.plots.length > 0 && (
                    <div className="flex flex-col gap-3">
                      {cell.plots.map((src, i) => (
                        <img
                          key={i}
                          src={src}
                          alt={`Plot ${i + 1}`}
                          className="rounded-lg w-full"
                          style={{ border: "1px solid var(--border)" }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </TooltipProvider>
  )
}
