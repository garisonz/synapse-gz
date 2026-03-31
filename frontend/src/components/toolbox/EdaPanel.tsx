"use client"

import React, { useMemo, useState } from "react"

// ── data helpers ─────────────────────────────────────────────────────────────

function getColValues(rows: string[][], idx: number): string[] {
  return rows.slice(1).map(r => r[idx] ?? "")
}

function isNumericCol(values: string[]): boolean {
  const nonEmpty = values.filter(v => v.trim() !== "")
  if (nonEmpty.length === 0) return false
  const numCount = nonEmpty.filter(v => !isNaN(parseFloat(v)) && isFinite(Number(v))).length
  return numCount / nonEmpty.length >= 0.8
}

type NumStats = {
  mean: number; median: number; min: number; max: number
  std: number; missing: number; q1: number; q3: number
  nums: number[]; sorted: number[]
}

function calcNumericStats(values: string[]): NumStats {
  const nums = values.filter(v => v.trim() !== "" && !isNaN(parseFloat(v))).map(Number)
  const missing = values.filter(v => v.trim() === "").length
  const sorted = [...nums].sort((a, b) => a - b)
  const n = nums.length
  if (n === 0) return { mean: 0, median: 0, min: 0, max: 0, std: 0, missing, q1: 0, q3: 0, nums, sorted }
  const mean = nums.reduce((s, x) => s + x, 0) / n
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)]
  const std = Math.sqrt(nums.reduce((s, x) => s + (x - mean) ** 2, 0) / n)
  const q1 = sorted[Math.floor(n * 0.25)]
  const q3 = sorted[Math.floor(n * 0.75)]
  return { mean, median, min: sorted[0], max: sorted[n - 1], std, missing, q1, q3, nums, sorted }
}

type FreqEntry = [string, number]

function topFrequencies(values: string[], n = 10): FreqEntry[] {
  const counts: Record<string, number> = {}
  for (const v of values) {
    const k = v.trim()
    if (k === "") continue
    counts[k] = (counts[k] || 0) + 1
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, n)
}

function pearson(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length)
  if (n < 2) return 0
  const meanA = a.slice(0, n).reduce((s, x) => s + x, 0) / n
  const meanB = b.slice(0, n).reduce((s, x) => s + x, 0) / n
  let num = 0, denA = 0, denB = 0
  for (let i = 0; i < n; i++) {
    const da = a[i] - meanA, db = b[i] - meanB
    num += da * db; denA += da * da; denB += db * db
  }
  return denA === 0 || denB === 0 ? 0 : num / Math.sqrt(denA * denB)
}

function fmt(n: number, decimals = 4): string {
  return isNaN(n) ? "—" : n.toFixed(decimals)
}

// ── stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-lg border p-3 flex flex-col gap-0.5"
      style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
    >
      <span
        className="text-[10px] font-semibold tracking-widest uppercase"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </span>
      <span
        className="text-lg font-semibold font-mono"
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </span>
    </div>
  )
}

// ── distribution bar chart ────────────────────────────────────────────────────

function DistributionChart({ entries, total }: { entries: FreqEntry[]; total: number }) {
  if (entries.length === 0) {
    return <p className="text-sm" style={{ color: "var(--text-muted)" }}>No data to display.</p>
  }
  const maxCount = Math.max(...entries.map(e => e[1]))
  const barH = 24, gap = 5, labelW = 130, barAreaW = 260, countW = 90
  const svgH = entries.length * (barH + gap)
  const svgW = labelW + barAreaW + countW

  return (
    <svg
      width={svgW}
      height={svgH}
      style={{ fontFamily: "monospace", overflow: "visible", display: "block" }}
    >
      {entries.map(([label, count], i) => {
        const y = i * (barH + gap)
        const barW = Math.max(3, (count / maxCount) * barAreaW)
        const pct = ((count / total) * 100).toFixed(1)
        const truncLabel = label.length > 17 ? label.slice(0, 16) + "…" : label
        return (
          <g key={`${label}-${i}`}>
            <text
              x={labelW - 8}
              y={y + barH / 2 + 4}
              textAnchor="end"
              style={{ fontSize: 11, fill: "var(--text-secondary)" }}
            >
              {truncLabel}
            </text>
            <rect
              x={labelW}
              y={y}
              width={barW}
              height={barH}
              rx={3}
              fill="rgba(16,185,129,0.35)"
            />
            <rect
              x={labelW}
              y={y}
              width={3}
              height={barH}
              rx={1}
              fill="rgba(16,185,129,0.8)"
            />
            <text
              x={labelW + barW + 8}
              y={y + barH / 2 + 4}
              style={{ fontSize: 11, fill: "var(--text-muted)" }}
            >
              {count}
              {"  "}
              <tspan style={{ fontSize: 10 }}>({pct}%)</tspan>
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// ── box plot ──────────────────────────────────────────────────────────────────

function BoxPlot({ stats }: { stats: NumStats }) {
  const { min, q1, median, q3, max } = stats
  if (stats.nums.length === 0) {
    return <p className="text-sm" style={{ color: "var(--text-muted)" }}>No numeric data available.</p>
  }
  const plotW = 500, plotH = 70, pad = 50
  const range = max - min || 1
  const scale = (v: number) => pad + ((v - min) / range) * (plotW - pad * 2)
  const xMin = scale(min), xQ1 = scale(q1), xMed = scale(median), xQ3 = scale(q3), xMax = scale(max)
  const midY = plotH / 2, boxH = 30

  const landmarks: [number, number, string][] = [
    [xMin, min, "Min"],
    [xQ1, q1, "Q1"],
    [xMed, median, "Med"],
    [xQ3, q3, "Q3"],
    [xMax, max, "Max"],
  ]

  return (
    <svg
      width={plotW}
      height={plotH + 32}
      style={{ overflow: "visible", display: "block" }}
    >
      {/* Whiskers */}
      <line x1={xMin} y1={midY} x2={xQ1} y2={midY} stroke="var(--text-secondary)" strokeWidth={1.5} />
      <line x1={xQ3} y1={midY} x2={xMax} y2={midY} stroke="var(--text-secondary)" strokeWidth={1.5} />
      {/* End caps */}
      <line x1={xMin} y1={midY - boxH / 2} x2={xMin} y2={midY + boxH / 2} stroke="var(--text-secondary)" strokeWidth={1.5} />
      <line x1={xMax} y1={midY - boxH / 2} x2={xMax} y2={midY + boxH / 2} stroke="var(--text-secondary)" strokeWidth={1.5} />
      {/* IQR box */}
      <rect
        x={xQ1} y={midY - boxH / 2}
        width={Math.max(2, xQ3 - xQ1)} height={boxH}
        fill="rgba(16,185,129,0.15)"
        stroke="rgba(16,185,129,0.55)"
        strokeWidth={1.5}
        rx={2}
      />
      {/* Median */}
      <line x1={xMed} y1={midY - boxH / 2} x2={xMed} y2={midY + boxH / 2} stroke="#f87171" strokeWidth={2.5} />
      {/* Labels */}
      {landmarks.map(([x, v, lbl]) => (
        <g key={lbl}>
          <text x={x} y={plotH + 14} textAnchor="middle" style={{ fontSize: 9, fill: "var(--text-muted)", fontFamily: "monospace" }}>
            {lbl}
          </text>
          <text x={x} y={plotH + 26} textAnchor="middle" style={{ fontSize: 9, fill: "var(--text-secondary)", fontFamily: "monospace" }}>
            {fmt(v, 2)}
          </text>
        </g>
      ))}
    </svg>
  )
}

// ── correlation heatmap ───────────────────────────────────────────────────────

function CorrelationMatrix({ rows, columns }: { rows: string[][]; columns: string[] }) {
  const numericCols = useMemo(() => {
    return columns
      .map((col, i) => ({ col, nums: getColValues(rows, i) }))
      .filter(({ nums }) => isNumericCol(nums))
      .map(({ col, nums }) => ({
        col,
        nums: nums.filter(v => v.trim() !== "" && !isNaN(parseFloat(v))).map(Number),
      }))
  }, [rows, columns])

  const matrix = useMemo(
    () => numericCols.map(a => numericCols.map(b => pearson(a.nums, b.nums))),
    [numericCols]
  )

  if (numericCols.length < 2) {
    return (
      <p className="text-sm py-8 text-center" style={{ color: "var(--text-muted)" }}>
        At least 2 numeric columns are required for correlation analysis.
      </p>
    )
  }

  const n = numericCols.length
  const cellSize = Math.max(44, Math.min(80, Math.floor(520 / n)))
  const labelW = 110
  const svgW = labelW + n * cellSize
  const svgH = labelW + n * cellSize

  function corrColor(r: number): string {
    const abs = Math.min(1, Math.abs(r))
    return r >= 0
      ? `rgba(16,185,129,${0.12 + abs * 0.72})`
      : `rgba(239,68,68,${0.12 + abs * 0.72})`
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <svg width={svgW} height={svgH} style={{ display: "block" }}>
        {/* Column headers */}
        {numericCols.map(({ col }, j) => (
          <text
            key={`ch-${j}`}
            x={labelW + j * cellSize + cellSize / 2}
            y={labelW - 8}
            textAnchor="end"
            transform={`rotate(-40,${labelW + j * cellSize + cellSize / 2},${labelW - 8})`}
            style={{ fontSize: 10, fill: "var(--text-secondary)", fontFamily: "monospace" }}
          >
            {col.length > 11 ? col.slice(0, 10) + "…" : col}
          </text>
        ))}
        {/* Row labels */}
        {numericCols.map(({ col }, i) => (
          <text
            key={`rl-${i}`}
            x={labelW - 8}
            y={labelW + i * cellSize + cellSize / 2 + 4}
            textAnchor="end"
            style={{ fontSize: 10, fill: "var(--text-secondary)", fontFamily: "monospace" }}
          >
            {col.length > 13 ? col.slice(0, 12) + "…" : col}
          </text>
        ))}
        {/* Cells */}
        {matrix.map((row, i) =>
          row.map((r, j) => {
            const x = labelW + j * cellSize
            const y = labelW + i * cellSize
            const textBright = Math.abs(r) > 0.55
            return (
              <g key={`${i}-${j}`}>
                <rect
                  x={x} y={y} width={cellSize} height={cellSize}
                  fill={corrColor(r)}
                  stroke="var(--bg-primary)"
                  strokeWidth={1}
                />
                <text
                  x={x + cellSize / 2}
                  y={y + cellSize / 2 + 4}
                  textAnchor="middle"
                  style={{
                    fontSize: cellSize > 55 ? 11 : 9,
                    fill: textBright ? "rgba(255,255,255,0.9)" : "var(--text-primary)",
                    fontFamily: "monospace",
                    fontWeight: 600,
                  }}
                >
                  {r.toFixed(2)}
                </text>
              </g>
            )
          })
        )}
      </svg>
      <div className="flex items-center gap-4 mt-3 text-xs" style={{ color: "var(--text-muted)" }}>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "rgba(239,68,68,0.75)" }} />
          Negative correlation
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-sm" style={{ background: "rgba(16,185,129,0.75)" }} />
          Positive correlation
        </span>
        <span>· Pearson r  (−1.00 to +1.00)</span>
      </div>
    </div>
  )
}

// ── raw data grid ─────────────────────────────────────────────────────────────

function RawDataGrid({ rows, columns }: { rows: string[][]; columns: string[] }) {
  const [search, setSearch] = useState("")
  const dataRows = rows.slice(1)

  const filtered = useMemo(() => {
    if (!search.trim()) return dataRows
    const q = search.toLowerCase()
    return dataRows.filter(row => row.some(cell => (cell ?? "").toLowerCase().includes(q)))
  }, [dataRows, search])

  const visible = filtered.slice(0, 50)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative" style={{ minWidth: 220, maxWidth: 340 }}>
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            width="13" height="13" viewBox="0 0 24 24"
            fill="none" stroke="var(--text-muted)" strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border outline-none"
            style={{
              background: "var(--bg-secondary)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
              fontFamily: "monospace",
            }}
            placeholder="Search all columns…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {visible.length} / {filtered.length} rows shown
          {search && filtered.length !== dataRows.length
            ? ` (filtered from ${dataRows.length})`
            : ""}
          {" "}· {columns.length} columns
        </span>
      </div>

      <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: 440, borderRadius: 8, border: "1px solid var(--border)" }}>
        <table style={{ borderCollapse: "collapse", fontFamily: "monospace", fontSize: 12, minWidth: "100%" }}>
          <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
            <tr>
              <th style={thStyle}>#</th>
              {columns.map(col => (
                <th key={col} style={thStyle}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "var(--bg-secondary)" }}>
                <td style={tdIndexStyle}>{i + 1}</td>
                {columns.map((_, j) => (
                  <td key={j} style={tdStyle}>{row[j] ?? ""}</td>
                ))}
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}
                >
                  No rows match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 50 && (
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Showing first 50 of {filtered.length} matching rows.
        </p>
      )}
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: "6px 12px",
  textAlign: "left",
  background: "var(--bg-secondary)",
  borderBottom: "1px solid var(--border)",
  color: "var(--text-muted)",
  fontSize: 10,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  whiteSpace: "nowrap",
}
const tdStyle: React.CSSProperties = {
  padding: "5px 12px",
  color: "var(--text-primary)",
  borderBottom: "1px solid var(--border)",
  maxWidth: 200,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
}
const tdIndexStyle: React.CSSProperties = {
  ...tdStyle,
  color: "var(--text-muted)",
  userSelect: "none",
}

// ── main panel ────────────────────────────────────────────────────────────────

type TabKey = "summary" | "visualizations" | "correlation" | "raw"

const TABS: { key: TabKey; label: string }[] = [
  { key: "summary", label: "Summary" },
  { key: "visualizations", label: "Visualizations" },
  { key: "correlation", label: "Correlation" },
  { key: "raw", label: "Raw Data" },
]

interface EdaPanelProps {
  parsedRows: string[][]
}

export function EdaPanel({ parsedRows }: EdaPanelProps) {
  const columns = parsedRows.length > 0 ? parsedRows[0] : []
  const [selectedCol, setSelectedCol] = useState(0)
  const [tab, setTab] = useState<TabKey>("summary")

  const colValues = useMemo(
    () => getColValues(parsedRows, selectedCol),
    [parsedRows, selectedCol]
  )
  const numeric = useMemo(() => isNumericCol(colValues), [colValues])
  const numStats = useMemo(
    () => (numeric ? calcNumericStats(colValues) : null),
    [colValues, numeric]
  )
  const freqs = useMemo(() => topFrequencies(colValues, 10), [colValues])
  const total = colValues.filter(v => v.trim() !== "").length
  const uniqueCount = new Set(colValues.filter(v => v.trim() !== "")).size
  const missingCount = colValues.filter(v => v.trim() === "").length

  if (parsedRows.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: "var(--bg-primary)" }}>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Upload a file in Upload mode to explore data here.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "var(--bg-primary)" }}>

      {/* Column selector */}
      <div
        className="shrink-0 px-5 py-3 flex items-center gap-3 flex-wrap"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-secondary)" }}
      >
        <span
          className="text-[10px] font-semibold tracking-widest uppercase shrink-0"
          style={{ color: "var(--text-muted)" }}
        >
          Column
        </span>
        <div className="flex gap-1.5 flex-wrap">
          {columns.map((col, i) => (
            <button
              key={col}
              onClick={() => setSelectedCol(i)}
              className="text-xs px-2.5 py-1 rounded-md transition-colors font-mono"
              style={{
                background: selectedCol === i ? "var(--text-primary)" : "var(--surface-active)",
                color: selectedCol === i ? "var(--bg-primary)" : "var(--text-secondary)",
                border: "1px solid var(--border)",
              }}
            >
              {col}
            </button>
          ))}
        </div>
      </div>

      {/* Tab bar */}
      <div
        className="flex shrink-0 px-5"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="text-sm px-4 py-2.5 transition-colors"
            style={{
              color: tab === t.key ? "var(--text-primary)" : "var(--text-muted)",
              borderBottom: tab === t.key ? "2px solid var(--text-primary)" : "2px solid transparent",
              fontWeight: tab === t.key ? 600 : 400,
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">

        {/* ── Summary ── */}
        {tab === "summary" && (
          <div className="flex flex-col gap-6 max-w-2xl">
            <div>
              <p
                className="text-[10px] font-semibold tracking-widest uppercase mb-3"
                style={{ color: "var(--text-muted)" }}
              >
                {columns[selectedCol]}
                {" "}·{" "}
                {numeric ? "Numeric" : "Categorical"}
              </p>
              {numeric && numStats ? (
                <div className="grid grid-cols-3 gap-2">
                  <StatCard label="Mean" value={fmt(numStats.mean)} />
                  <StatCard label="Median" value={fmt(numStats.median)} />
                  <StatCard label="Std Dev" value={fmt(numStats.std)} />
                  <StatCard label="Min" value={fmt(numStats.min)} />
                  <StatCard label="Max" value={fmt(numStats.max)} />
                  <StatCard label="Missing" value={String(numStats.missing)} />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <StatCard label="Unique Values" value={String(uniqueCount)} />
                  <StatCard label="Missing" value={String(missingCount)} />
                </div>
              )}
            </div>

            <div>
              <p
                className="text-[10px] font-semibold tracking-widest uppercase mb-2"
                style={{ color: "var(--text-muted)" }}
              >
                Top Values
              </p>
              <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--border)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "var(--bg-secondary)" }}>
                      {["Value", "Count", "Frequency"].map(h => (
                        <th
                          key={h}
                          style={{
                            padding: "8px 14px",
                            textAlign: h === "Value" ? "left" : "right",
                            color: "var(--text-muted)",
                            fontSize: 10,
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {freqs.map(([val, count], i) => (
                      <tr
                        key={`${val}-${i}`}
                        style={{
                          background: i % 2 === 0 ? "transparent" : "var(--bg-secondary)",
                          borderTop: "1px solid var(--border)",
                        }}
                      >
                        <td style={{ padding: "7px 14px", color: "var(--text-primary)", fontFamily: "monospace" }}>
                          {val}
                        </td>
                        <td style={{ padding: "7px 14px", textAlign: "right", color: "var(--text-secondary)", fontFamily: "monospace" }}>
                          {count}
                        </td>
                        <td style={{ padding: "7px 14px", textAlign: "right", color: "var(--text-muted)", fontFamily: "monospace" }}>
                          {((count / total) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Visualizations ── */}
        {tab === "visualizations" && (
          <div className="flex flex-col gap-7 max-w-3xl">
            <div>
              <p
                className="text-[10px] font-semibold tracking-widest uppercase mb-3"
                style={{ color: "var(--text-muted)" }}
              >
                Distribution — Top 10 Values
              </p>
              <div
                className="rounded-lg border p-5"
                style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
              >
                <DistributionChart entries={freqs} total={total} />
              </div>
            </div>

            {numeric && numStats ? (
              <div>
                <p
                  className="text-[10px] font-semibold tracking-widest uppercase mb-3"
                  style={{ color: "var(--text-muted)" }}
                >
                  Box Plot — Outlier Analysis
                </p>
                <div
                  className="rounded-lg border p-5"
                  style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
                >
                  <BoxPlot stats={numStats} />
                  <div
                    className="flex gap-5 mt-4 text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <span><span style={{ color: "#f87171", fontWeight: 700 }}>─</span> Median</span>
                    <span><span style={{ color: "rgba(16,185,129,0.7)", fontWeight: 700 }}>█</span> IQR (Q1–Q3)</span>
                    <span>⊢⊣ Min / Max whiskers</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Box plot is only available for numeric columns.
              </p>
            )}
          </div>
        )}

        {/* ── Correlation ── */}
        {tab === "correlation" && (
          <div className="flex flex-col gap-4 max-w-4xl">
            <p
              className="text-[10px] font-semibold tracking-widest uppercase"
              style={{ color: "var(--text-muted)" }}
            >
              Feature Correlation Matrix — Pearson Coefficient
            </p>
            <div
              className="rounded-lg border p-5"
              style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
            >
              <CorrelationMatrix rows={parsedRows} columns={columns} />
            </div>
          </div>
        )}

        {/* ── Raw Data ── */}
        {tab === "raw" && (
          <div className="flex flex-col gap-4">
            <p
              className="text-[10px] font-semibold tracking-widest uppercase"
              style={{ color: "var(--text-muted)" }}
            >
              Raw Data Inspector
            </p>
            <RawDataGrid rows={parsedRows} columns={columns} />
          </div>
        )}
      </div>
    </div>
  )
}
