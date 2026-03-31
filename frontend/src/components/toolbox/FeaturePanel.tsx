"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"

// ── types ─────────────────────────────────────────────────────────────────────

type LogLevel = "success" | "error" | "info"

interface LogEntry {
  id: number
  ts: string
  level: LogLevel
  message: string
}

type TransformId =
  | "minmax"
  | "standard"
  | "log"
  | "polynomial"
  | "onehot"
  | "binning"
  | "mean_impute"
  | "drop"

interface Transform {
  id: TransformId
  label: string
  description: string
  category: string
  icon: React.ReactNode
}

// ── helpers ───────────────────────────────────────────────────────────────────

function isNumericCol(values: string[]): boolean {
  const nonEmpty = values.filter(v => v.trim() !== "")
  if (nonEmpty.length === 0) return false
  return nonEmpty.filter(v => !isNaN(parseFloat(v)) && isFinite(Number(v))).length / nonEmpty.length >= 0.8
}

function colValues(rows: string[][], idx: number): string[] {
  return rows.slice(1).map(r => r[idx] ?? "")
}

function missingCount(rows: string[][]): number {
  return rows.slice(1).reduce((sum, row) => sum + row.filter(c => (c ?? "").trim() === "").length, 0)
}

function numericColCount(rows: string[][], colCount: number): number {
  let n = 0
  for (let i = 0; i < colCount; i++) {
    if (isNumericCol(colValues(rows, i))) n++
  }
  return n
}

function fmt6(n: number): string {
  return parseFloat(n.toFixed(6)).toString()
}

function nowTs(): string {
  return new Date().toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })
}

// ── transforms ────────────────────────────────────────────────────────────────

function applyTransform(
  rows: string[][],
  selectedCols: number[],
  transformId: TransformId
): { rows: string[][]; log: string; error?: string } {
  if (selectedCols.length === 0) return { rows, log: "", error: "No columns selected." }

  const headers = [...rows[0]]
  const data: string[][] = rows.slice(1).map(r => [...r])
  const colNames = selectedCols.map(i => headers[i]).join(", ")

  switch (transformId) {
    case "minmax": {
      for (const ci of selectedCols) {
        const vals = data.map(r => parseFloat(r[ci]))
        const nums = vals.filter(v => !isNaN(v))
        if (nums.length === 0) return { rows, log: "", error: `Column "${headers[ci]}" has no numeric values.` }
        const min = Math.min(...nums), max = Math.max(...nums)
        const range = max - min || 1
        data.forEach((r, i) => {
          const v = parseFloat(r[ci])
          r[ci] = isNaN(v) ? r[ci] : fmt6((v - min) / range)
        })
      }
      return { rows: [headers, ...data], log: `Min-Max Scaling applied to: ${colNames}` }
    }

    case "standard": {
      for (const ci of selectedCols) {
        const vals = data.map(r => parseFloat(r[ci])).filter(v => !isNaN(v))
        if (vals.length === 0) return { rows, log: "", error: `Column "${headers[ci]}" has no numeric values.` }
        const mean = vals.reduce((s, x) => s + x, 0) / vals.length
        const std = Math.sqrt(vals.reduce((s, x) => s + (x - mean) ** 2, 0) / vals.length) || 1
        data.forEach(r => {
          const v = parseFloat(r[ci])
          r[ci] = isNaN(v) ? r[ci] : fmt6((v - mean) / std)
        })
      }
      return { rows: [headers, ...data], log: `Standard Scaling applied to: ${colNames}` }
    }

    case "log": {
      for (const ci of selectedCols) {
        for (const r of data) {
          const v = parseFloat(r[ci])
          if (!isNaN(v)) {
            if (v <= 0) return { rows, log: "", error: `Log transform requires positive values. Column "${headers[ci]}" contains ${v}.` }
            r[ci] = fmt6(Math.log(v))
          }
        }
      }
      return { rows: [headers, ...data], log: `Log Transform applied to: ${colNames}` }
    }

    case "polynomial": {
      const newHeaders = [...headers]
      const newCols: string[][] = Array.from({ length: data.length }, () => [])

      for (const ci of selectedCols) {
        const colHeader = `${headers[ci]}^2`
        newHeaders.push(colHeader)
        data.forEach((r, i) => {
          const v = parseFloat(r[ci])
          newCols[i].push(isNaN(v) ? "" : fmt6(v * v))
        })
      }
      for (let a = 0; a < selectedCols.length; a++) {
        for (let b = a + 1; b < selectedCols.length; b++) {
          const ca = selectedCols[a], cb = selectedCols[b]
          newHeaders.push(`${headers[ca]}*${headers[cb]}`)
          data.forEach((r, i) => {
            const va = parseFloat(r[ca]), vb = parseFloat(r[cb])
            newCols[i].push(isNaN(va) || isNaN(vb) ? "" : fmt6(va * vb))
          })
        }
      }
      const finalData = data.map((r, i) => [...r, ...newCols[i]])
      const added = newHeaders.length - headers.length
      return {
        rows: [newHeaders, ...finalData],
        log: `Polynomial Features: added ${added} new column(s) from [${colNames}]`,
      }
    }

    case "onehot": {
      const toEncode = [...selectedCols].sort((a, b) => b - a) // process right-to-left so indices stay valid
      const insertions: { afterIdx: number; colHeader: string; vals: string[] }[] = []

      for (const ci of [...selectedCols].sort((a, b) => a - b)) {
        const unique = Array.from(new Set(data.map(r => r[ci]).filter(v => v.trim() !== ""))).sort()
        for (const uv of unique) {
          insertions.push({
            afterIdx: ci,
            colHeader: `${headers[ci]}_${uv}`,
            vals: data.map(r => r[ci] === uv ? "1" : "0"),
          })
        }
      }

      // Build new structure: remove original cols, append encoded cols
      const keepIndices = headers.map((_, i) => i).filter(i => !selectedCols.includes(i))
      const newH = [
        ...keepIndices.map(i => headers[i]),
        ...insertions.map(ins => ins.colHeader),
      ]
      const newData = data.map((r, rowIdx) => [
        ...keepIndices.map(i => r[i]),
        ...insertions.map(ins => ins.vals[rowIdx]),
      ])
      return {
        rows: [newH, ...newData],
        log: `One-Hot Encoding applied to: ${colNames} → ${insertions.length} new binary column(s) added`,
      }
    }

    case "binning": {
      for (const ci of selectedCols) {
        const vals = data.map(r => parseFloat(r[ci])).filter(v => !isNaN(v))
        if (vals.length === 0) return { rows, log: "", error: `Column "${headers[ci]}" has no numeric values for binning.` }
        const min = Math.min(...vals), max = Math.max(...vals)
        const binWidth = (max - min) / 5 || 1
        data.forEach(r => {
          const v = parseFloat(r[ci])
          if (!isNaN(v)) {
            const bin = Math.min(4, Math.floor((v - min) / binWidth))
            const lo = (min + bin * binWidth).toFixed(2)
            const hi = (min + (bin + 1) * binWidth).toFixed(2)
            r[ci] = `[${lo}, ${hi})`
          }
        })
      }
      return { rows: [headers, ...data], log: `Binning (5 equal-width bins) applied to: ${colNames}` }
    }

    case "mean_impute": {
      for (const ci of selectedCols) {
        const vals = data.map(r => parseFloat(r[ci])).filter(v => !isNaN(v))
        if (vals.length === 0) return { rows, log: "", error: `Column "${headers[ci]}" has no numeric values for imputation.` }
        const mean = fmt6(vals.reduce((s, x) => s + x, 0) / vals.length)
        data.forEach(r => { if (r[ci].trim() === "") r[ci] = mean })
      }
      return { rows: [headers, ...data], log: `Mean Imputation applied to: ${colNames}` }
    }

    case "drop": {
      const keepIndices = headers.map((_, i) => i).filter(i => !selectedCols.includes(i))
      const newH = keepIndices.map(i => headers[i])
      const newData = data.map(r => keepIndices.map(i => r[i]))
      return {
        rows: [newH, ...newData],
        log: `Dropped ${selectedCols.length} column(s): ${colNames}`,
      }
    }

    default:
      return { rows, log: "", error: "Unknown transform." }
  }
}

// ── transform definitions ─────────────────────────────────────────────────────

const TRANSFORMS: Transform[] = [
  {
    id: "minmax",
    label: "Min-Max Scaling",
    description: "Squishes values into a [0, 1] range.",
    category: "Scaling",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <line x1="3" y1="12" x2="21" y2="12" />
        <polyline points="8,7 3,12 8,17" />
        <polyline points="16,7 21,12 16,17" />
      </svg>
    ),
  },
  {
    id: "standard",
    label: "Standard Scaling",
    description: "Z-score normalisation (zero mean, unit variance).",
    category: "Scaling",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 20 Q8 4 12 12 Q16 20 20 4" />
      </svg>
    ),
  },
  {
    id: "log",
    label: "Log Transform",
    description: "Applies ln(x) to reduce skew in numeric columns.",
    category: "Mathematical",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 20 C6 20 6 4 8 4" />
        <path d="M12 8 Q15 4 18 8 Q21 12 18 16 Q15 20 12 16 Q9 12 12 8Z" />
      </svg>
    ),
  },
  {
    id: "polynomial",
    label: "Polynomial Features",
    description: "Generates x² and x·y interaction terms.",
    category: "Mathematical",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 20 Q9 4 12 12 Q15 20 21 4" />
      </svg>
    ),
  },
  {
    id: "onehot",
    label: "One-Hot Encoding",
    description: "Converts categories into binary 0/1 columns.",
    category: "Categorical",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" fill="currentColor" opacity="0.3" />
        <rect x="3" y="14" width="7" height="7" rx="1" fill="currentColor" opacity="0.3" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: "binning",
    label: "Binning",
    description: "Groups continuous values into 5 equal-width bins.",
    category: "Categorical",
    icon: (
      <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="8" width="2.5" height="7" rx="0.5" />
        <rect x="4.5" y="5" width="2.5" height="10" rx="0.5" />
        <rect x="8" y="3" width="2.5" height="12" rx="0.5" />
        <rect x="11.5" y="6" width="2.5" height="9" rx="0.5" />
      </svg>
    ),
  },
  {
    id: "mean_impute",
    label: "Mean Imputation",
    description: "Fills missing values with the column mean.",
    category: "Cleaning",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="9" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
  },
  {
    id: "drop",
    label: "Drop Columns",
    description: "Permanently removes selected columns from the dataset.",
    category: "Cleaning",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      </svg>
    ),
  },
]

const CATEGORY_COLORS: Record<string, string> = {
  Scaling: "rgba(59,130,246,0.15)",
  Mathematical: "rgba(139,92,246,0.15)",
  Categorical: "rgba(245,158,11,0.15)",
  Cleaning: "rgba(239,68,68,0.15)",
}
const CATEGORY_TEXT: Record<string, string> = {
  Scaling: "#60a5fa",
  Mathematical: "#a78bfa",
  Categorical: "#fbbf24",
  Cleaning: "#f87171",
}

// ── log icons ─────────────────────────────────────────────────────────────────

function LogIcon({ level }: { level: LogLevel }) {
  if (level === "success") {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )
  }
  if (level === "error") {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    )
  }
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )
}

const LOG_COLOR: Record<LogLevel, string> = {
  success: "#34d399",
  error: "#f87171",
  info: "#93c5fd",
}

// ── main panel ────────────────────────────────────────────────────────────────

let logSeq = 0

interface FeaturePanelProps {
  parsedRows: string[][]
}

export function FeaturePanel({ parsedRows }: FeaturePanelProps) {
  const [workingRows, setWorkingRows] = useState<string[][]>(parsedRows)
  const [selectedCols, setSelectedCols] = useState<Set<number>>(new Set())
  const [activeTransform, setActiveTransform] = useState<TransformId | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])

  // Reset when a new file is loaded
  useEffect(() => {
    setWorkingRows(parsedRows)
    setSelectedCols(new Set())
    setActiveTransform(null)
    setLogs([])
  }, [parsedRows])

  const workingCols = workingRows.length > 0 ? workingRows[0] : []
  const rowCount = Math.max(0, workingRows.length - 1)
  const colCount = workingCols.length
  const numCols = useMemo(() => numericColCount(workingRows, colCount), [workingRows, colCount])
  const missing = useMemo(() => missingCount(workingRows), [workingRows])

  const addLog = useCallback((level: LogLevel, message: string) => {
    setLogs(prev => [...prev, { id: ++logSeq, ts: nowTs(), level, message }])
  }, [])

  const toggleCol = (i: number) => {
    setSelectedCols(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const selectAll = () => setSelectedCols(new Set(workingCols.map((_, i) => i)))
  const clearAll = () => setSelectedCols(new Set())

  const handleApply = useCallback(() => {
    if (!activeTransform) {
      addLog("error", "Select a transformation first.")
      return
    }
    if (selectedCols.size === 0) {
      addLog("error", "Select at least one column to transform.")
      return
    }

    setIsProcessing(true)
    addLog("info", `Applying ${TRANSFORMS.find(t => t.id === activeTransform)?.label}…`)

    // Defer so the UI can render the loading state
    setTimeout(() => {
      const result = applyTransform(workingRows, [...selectedCols].sort((a, b) => a - b), activeTransform)
      if (result.error) {
        addLog("error", result.error)
      } else {
        setWorkingRows(result.rows)
        setSelectedCols(new Set())
        addLog("success", result.log)
      }
      setIsProcessing(false)
    }, 0)
  }, [activeTransform, selectedCols, workingRows, addLog])

  if (parsedRows.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Upload a file in Upload mode to begin feature engineering.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 overflow-hidden" style={{ background: "var(--bg-primary)" }}>

      {/* ── Left: Column selection panel ── */}
      <div
        className="flex flex-col shrink-0 overflow-hidden"
        style={{ width: 220, borderRight: "1px solid var(--border)", background: "var(--bg-secondary)" }}
      >
        {/* Dataset stats */}
        <div className="p-3 shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
          <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>
            Active Dataset
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              ["Rows", rowCount],
              ["Cols", colCount],
              ["Numeric", numCols],
              ["Missing", missing],
            ].map(([label, val]) => (
              <div
                key={String(label)}
                className="rounded-md p-2 flex flex-col"
                style={{ background: "var(--surface-active)" }}
              >
                <span className="text-[9px] font-semibold tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
                  {label}
                </span>
                <span className="text-sm font-semibold font-mono" style={{ color: "var(--text-primary)" }}>
                  {val}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Column header */}
        <div className="px-3 pt-2.5 pb-1.5 flex items-center justify-between shrink-0">
          <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
            Columns{" "}
            {selectedCols.size > 0 && (
              <span
                className="ml-1 px-1.5 py-0.5 rounded-full text-[9px]"
                style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}
              >
                {selectedCols.size}
              </span>
            )}
          </span>
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="text-[10px] transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--text-primary)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              all
            </button>
            <button
              onClick={clearAll}
              className="text-[10px] transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--text-primary)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
            >
              none
            </button>
          </div>
        </div>

        {/* Column list */}
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {workingCols.map((col, i) => {
            const isSelected = selectedCols.has(i)
            const numeric = isNumericCol(colValues(workingRows, i))
            return (
              <button
                key={`${col}-${i}`}
                onClick={() => toggleCol(i)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md mb-0.5 text-left transition-colors"
                style={{
                  background: isSelected ? "rgba(245,158,11,0.08)" : "transparent",
                  border: isSelected ? "1px solid rgba(245,158,11,0.3)" : "1px solid transparent",
                }}
              >
                {/* Checkbox */}
                <div
                  className="w-3.5 h-3.5 rounded shrink-0 flex items-center justify-center"
                  style={{
                    background: isSelected ? "#f59e0b" : "var(--surface-active)",
                    border: isSelected ? "none" : "1px solid var(--border)",
                  }}
                >
                  {isSelected && (
                    <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2">
                      <polyline points="2,5 4,7 8,3" />
                    </svg>
                  )}
                </div>
                <span
                  className="text-xs truncate font-mono flex-1"
                  style={{ color: isSelected ? "var(--text-primary)" : "var(--text-secondary)" }}
                >
                  {col}
                </span>
                {/* Type badge */}
                <span
                  className="text-[9px] shrink-0 px-1 rounded"
                  style={{
                    background: numeric ? "rgba(59,130,246,0.12)" : "rgba(245,158,11,0.12)",
                    color: numeric ? "#60a5fa" : "#fbbf24",
                  }}
                >
                  {numeric ? "num" : "cat"}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Right: Transform grid + action bar + logs ── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5">

          {/* Transform grid */}
          <p className="text-xs font-semibold mb-3" style={{ color: "var(--text-muted)" }}>
            Transformation Toolbox
          </p>
          <div className="grid grid-cols-2 gap-3 max-w-2xl mb-6">
            {TRANSFORMS.map(t => {
              const isActive = activeTransform === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTransform(isActive ? null : t.id)}
                  className="rounded-xl border p-4 text-left flex flex-col gap-2.5 transition-all"
                  style={{
                    borderColor: isActive ? CATEGORY_TEXT[t.category] + "60" : "var(--border)",
                    background: isActive ? CATEGORY_COLORS[t.category] : "var(--bg-secondary)",
                    boxShadow: isActive ? `0 0 0 2px ${CATEGORY_TEXT[t.category]}20` : "none",
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: CATEGORY_COLORS[t.category],
                        color: CATEGORY_TEXT[t.category],
                      }}
                    >
                      {t.icon}
                    </div>
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full mt-0.5"
                      style={{
                        background: CATEGORY_COLORS[t.category],
                        color: CATEGORY_TEXT[t.category],
                      }}
                    >
                      {t.category}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--text-primary)" }}>
                      {t.label}
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                      {t.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Action bar ── */}
        <div
          className="shrink-0 px-5 py-3 flex items-center gap-4"
          style={{ borderTop: "1px solid var(--border)", background: "var(--bg-secondary)" }}
        >
          <div className="flex-1 min-w-0">
            {activeTransform && selectedCols.size > 0 ? (
              <p className="text-sm font-mono truncate" style={{ color: "var(--text-primary)" }}>
                <span style={{ color: "#f59e0b" }}>{selectedCols.size} column{selectedCols.size !== 1 ? "s" : ""}</span>
                {" "}selected for{" "}
                <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  {TRANSFORMS.find(t => t.id === activeTransform)?.label}
                </span>
              </p>
            ) : (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {!activeTransform && selectedCols.size === 0
                  ? "Select columns and a transformation to continue."
                  : !activeTransform
                  ? `${selectedCols.size} column${selectedCols.size !== 1 ? "s" : ""} selected — choose a transformation.`
                  : "Select columns from the panel to apply the transformation."}
              </p>
            )}
          </div>
          <button
            onClick={handleApply}
            disabled={isProcessing || !activeTransform || selectedCols.size === 0}
            className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold shrink-0 transition-all"
            style={{
              background: (!activeTransform || selectedCols.size === 0)
                ? "var(--surface-active)"
                : "rgba(245,158,11,0.12)",
              color: (!activeTransform || selectedCols.size === 0) ? "var(--text-muted)" : "#f59e0b",
              border: (!activeTransform || selectedCols.size === 0)
                ? "1px solid var(--border)"
                : "1px solid rgba(245,158,11,0.35)",
              cursor: (!activeTransform || selectedCols.size === 0) ? "not-allowed" : "pointer",
            }}
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Processing…
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Apply
              </>
            )}
          </button>
        </div>

        {/* ── Process logs ── */}
        <div
          className="shrink-0 flex flex-col"
          style={{
            height: 160,
            borderTop: "1px solid var(--border)",
            background: "#0d1117",
          }}
        >
          <div
            className="px-3 py-1.5 flex items-center justify-between shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(239,68,68,0.5)" }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(245,158,11,0.5)" }} />
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: "rgba(52,211,153,0.5)" }} />
              </div>
              <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.3)" }}>
                Process Log
              </span>
            </div>
            {logs.length > 0 && (
              <button
                onClick={() => setLogs([])}
                className="text-[10px] transition-colors"
                style={{ color: "rgba(255,255,255,0.3)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
              >
                clear
              </button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-1">
            {logs.length === 0 ? (
              <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>
                $ waiting for input — apply a transformation to see output here
              </span>
            ) : (
              logs.map(entry => (
                <div key={entry.id} className="flex items-start gap-2 font-mono text-xs">
                  <span className="shrink-0 mt-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>{entry.ts}</span>
                  <span className="shrink-0 mt-0.5">
                    <LogIcon level={entry.level} />
                  </span>
                  <span style={{ color: LOG_COLOR[entry.level] }}>{entry.message}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
