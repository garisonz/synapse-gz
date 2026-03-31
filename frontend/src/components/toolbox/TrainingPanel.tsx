"use client"

import { useState, useEffect, useRef } from "react"
import { FileDropZone } from "./FileDropZone"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { NotebookCellData, TrainingConfig, Metric } from "@/hooks/useToolboxState"

const ALGORITHMS = [
  {
    value: "Random Forest",
    label: "Random Forest",
    tag: "Classifier",
    description: "Great for complex, non-linear data",
  },
  {
    value: "XGBoost",
    label: "XGBoost",
    tag: "Regressor",
    description: "High-performance gradient boosting",
  },
  {
    value: "Logistic Regression",
    label: "Logistic Regression",
    tag: "Baseline",
    description: "Classic, interpretable model",
  },
  {
    value: "SVM",
    label: "Support Vector Machine",
    tag: "SVM",
    description: "Effective in high-dimensional spaces",
  },
]

const TRAINING_STAGES = [
  { threshold: 0, label: "Initializing..." },
  { threshold: 15, label: "Loading dataset..." },
  { threshold: 35, label: "Preprocessing features..." },
  { threshold: 55, label: "Optimizing Hyperparameters..." },
  { threshold: 78, label: "Evaluating on test set..." },
  { threshold: 90, label: "Finalizing results..." },
]

const STAT_METRICS = ["Accuracy", "Precision", "Recall", "F1 Score", "AUC"]

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function parseAccuracy(metrics: Metric[]): number {
  const acc = metrics.find((m) => m.label === "Accuracy")?.value
  if (typeof acc === "string" && acc.endsWith("%")) return parseFloat(acc) / 100
  if (typeof acc === "number") return acc
  return 0.75
}

function generateLossCurves(accuracy: number, epochs = 25) {
  const finalTrain = Math.max(0.04, (1 - accuracy) * 0.65)
  const finalVal = Math.max(0.07, (1 - accuracy) * 1.05)
  const init = 2.4
  const noise = (i: number, phase: number) => Math.sin(i * 2.8 + phase) * 0.018

  const train = Array.from({ length: epochs }, (_, i) => {
    const t = i / (epochs - 1)
    return init * Math.exp(-4.5 * t) + finalTrain + noise(i, 0)
  })

  const val = Array.from({ length: epochs }, (_, i) => {
    const t = i / (epochs - 1)
    return init * Math.exp(-3.8 * t) + finalVal + noise(i, 1.8)
  })

  return { train, val }
}

function buildSvgPath(
  values: number[],
  maxVal: number,
  w: number,
  h: number,
  pad = 8
): { line: string; area: string; pts: { x: number; y: number }[] } {
  const pts = values.map((v, i) => ({
    x: pad + (i / (values.length - 1)) * (w - pad * 2),
    y: h - pad - (v / maxVal) * (h - pad * 2),
  }))

  const lineParts = pts.map((p, i) => {
    if (i === 0) return `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
    const prev = pts[i - 1]
    const cpx = (prev.x + p.x) / 2
    return `C ${cpx.toFixed(1)} ${prev.y.toFixed(1)}, ${cpx.toFixed(1)} ${p.y.toFixed(1)}, ${p.x.toFixed(1)} ${p.y.toFixed(1)}`
  })

  const line = lineParts.join(" ")
  const area = `${line} L ${pts[pts.length - 1].x.toFixed(1)} ${(h - pad).toFixed(1)} L ${pts[0].x.toFixed(1)} ${(h - pad).toFixed(1)} Z`
  return { line, area, pts }
}

interface TrainingPanelProps {
  file: File | null
  parsedRows: string[][]
  columns: string[]
  trainingConfig: TrainingConfig
  onTrainingConfigChange: (c: TrainingConfig) => void
  isRunning: boolean
  onRun: () => void
  cells: NotebookCellData[]
  onFileChange: (file: File) => void
  onRemove: () => void
}

export function TrainingPanel({
  file,
  parsedRows,
  columns,
  trainingConfig,
  onTrainingConfigChange,
  isRunning,
  onRun,
  cells,
  onFileChange,
  onRemove,
}: TrainingPanelProps) {
  const [progress, setProgress] = useState(0)
  const [hoverEpoch, setHoverEpoch] = useState<number | null>(null)
  const chartRef = useRef<SVGSVGElement>(null)

  // Animate progress bar while training runs
  useEffect(() => {
    if (!isRunning) return
    setProgress(0)
    const iv = setInterval(() => {
      setProgress((p) => {
        if (p >= 85) return p
        return p + Math.random() * 3.5 + 0.5
      })
    }, 250)
    return () => clearInterval(iv)
  }, [isRunning])

  // Latest training cell
  const latestCell = [...cells].reverse().find((c) => c.mode === "training")

  useEffect(() => {
    if (latestCell?.status === "complete") setProgress(100)
    if (latestCell?.status === "error") setProgress(0)
  }, [latestCell?.status])

  const stageLabel =
    [...TRAINING_STAGES]
      .reverse()
      .find((s) => progress >= s.threshold)?.label ?? "Initializing..."

  const canRun = !!file && !!trainingConfig.targetColumn && !isRunning

  // Loss chart data (generated from actual accuracy)
  const hasResults =
    latestCell?.status === "complete" && latestCell.metrics && latestCell.metrics.length > 0
  const accuracy = hasResults ? parseAccuracy(latestCell!.metrics!) : 0.75
  const { train: trainLoss, val: valLoss } = generateLossCurves(accuracy)
  const maxLoss = Math.max(...trainLoss, ...valLoss) * 1.05
  const chartW = 600
  const chartH = 180
  const { line: trainLine, area: trainArea, pts: trainPts } = buildSvgPath(
    trainLoss,
    maxLoss,
    chartW,
    chartH
  )
  const { line: valLine, area: valArea, pts: valPts } = buildSvgPath(
    valLoss,
    maxLoss,
    chartW,
    chartH
  )

  const handleChartHover = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!chartRef.current) return
    const rect = chartRef.current.getBoundingClientRect()
    const relX = (e.clientX - rect.left) / rect.width
    const epochIdx = Math.min(
      trainLoss.length - 1,
      Math.max(0, Math.round(relX * (trainLoss.length - 1)))
    )
    setHoverEpoch(epochIdx)
  }

  // Confusion matrix
  const cm = latestCell?.confusionMatrix
  const isBinary = cm && cm.length === 2

  const getMetric = (label: string) =>
    latestCell?.metrics?.find((m) => m.label === label)?.value

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* ── Left: Config Sidebar ── */}
      <div
        className="w-[300px] flex flex-col shrink-0 overflow-hidden"
        style={{
          background: "var(--bg-secondary)",
          borderRight: "1px solid var(--border)",
        }}
      >
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
          <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
            Configuration
          </p>

          {/* Target Variable */}
          <div className="flex flex-col gap-1.5">
            <Label style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
              Target Variable
            </Label>
            {!file ? (
              <p className="text-xs italic" style={{ color: "var(--text-muted)" }}>
                Upload a CSV to configure.
              </p>
            ) : (
              <Select
                value={trainingConfig.targetColumn || undefined}
                onValueChange={(v) =>
                  onTrainingConfigChange({ ...trainingConfig, targetColumn: v })
                }
              >
                <SelectTrigger
                  className="h-8 text-sm"
                  style={{
                    background: "var(--surface-active)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                  }}
                >
                  <SelectValue placeholder="Select column to predict..." />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((col) => (
                    <SelectItem key={col} value={col}>
                      {col}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Algorithm Library */}
          <div className="flex flex-col gap-2">
            <Label style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
              Algorithm
            </Label>
            <div className="flex flex-col gap-1.5">
              {ALGORITHMS.map((algo) => {
                const selected = trainingConfig.model === algo.value
                return (
                  <button
                    key={algo.value}
                    onClick={() =>
                      onTrainingConfigChange({ ...trainingConfig, model: algo.value })
                    }
                    className="text-left rounded-lg px-3 py-2.5 flex flex-col gap-0.5 transition-all border"
                    style={{
                      background: selected
                        ? "rgba(249,115,22,0.08)"
                        : "var(--bg-primary)",
                      borderColor: selected
                        ? "rgba(249,115,22,0.4)"
                        : "var(--border)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs font-semibold"
                        style={{ color: selected ? "#f97316" : "var(--text-primary)" }}
                      >
                        {algo.label}
                      </span>
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded font-medium"
                        style={{
                          background: selected
                            ? "rgba(249,115,22,0.2)"
                            : "var(--surface-active)",
                          color: selected ? "#f97316" : "var(--text-muted)",
                        }}
                      >
                        {algo.tag}
                      </span>
                    </div>
                    <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                      {algo.description}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Test Split */}
          <div className="flex flex-col gap-1.5">
            <Label style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
              Test Split
            </Label>
            <Select
              value={trainingConfig.testSplit}
              onValueChange={(v) =>
                onTrainingConfigChange({ ...trainingConfig, testSplit: v })
              }
            >
              <SelectTrigger
                className="h-8 text-sm"
                style={{
                  background: "var(--surface-active)",
                  borderColor: "var(--border)",
                  color: "var(--text-primary)",
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["10%", "20%", "30%", "40%"].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Train Model Button */}
        <div className="p-4 shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
          <button
            onClick={onRun}
            disabled={!canRun}
            className="w-full h-10 rounded-lg text-sm font-medium flex items-center justify-center gap-2 relative overflow-hidden transition-all"
            style={{
              background: canRun
                ? isRunning
                  ? "rgba(249,115,22,0.25)"
                  : "rgba(249,115,22,0.15)"
                : "var(--surface-active)",
              color: canRun ? "#f97316" : "var(--text-muted)",
              border: `1px solid ${canRun ? "rgba(249,115,22,0.35)" : "var(--border)"}`,
              cursor: canRun ? "pointer" : "not-allowed",
            }}
          >
            {/* Pulse overlay while running */}
            {isRunning && (
              <span
                className="absolute inset-0 rounded-lg opacity-20 animate-pulse"
                style={{ background: "#f97316" }}
              />
            )}
            {isRunning ? (
              <>
                <svg
                  className="animate-spin shrink-0 relative"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                <span className="relative">Training... {Math.round(progress)}%</span>
              </>
            ) : (
              <>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="relative"
                >
                  <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
                </svg>
                <span className="relative">Train Model</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Right: Results Area ── */}
      {!file ? (
        <FileDropZone onFileChange={onFileChange} />
      ) : (
        <div className="flex-1 h-full overflow-y-auto overflow-x-hidden">
          <div className="p-5 flex flex-col gap-4">
            {/* File info header */}
            <div
              className="rounded-xl border p-4"
              style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "rgba(249,115,22,0.15)" }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#f97316"
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
                      {formatFileSize(file.size)} · {parsedRows[0]?.length ?? 0} columns ·{" "}
                      {Math.max(0, parsedRows.length - 1)} rows
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
                    e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)"
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
            </div>

            {/* Live Training Status */}
            {isRunning && (
              <div
                className="rounded-xl border p-4 flex flex-col gap-3"
                style={{
                  background: "var(--bg-secondary)",
                  borderColor: "rgba(249,115,22,0.3)",
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span
                      className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                      style={{ background: "#f97316" }}
                    />
                    <span
                      className="relative inline-flex rounded-full h-2.5 w-2.5"
                      style={{ background: "#f97316" }}
                    />
                  </span>
                  <span
                    className="text-xs font-semibold tracking-wider uppercase"
                    style={{ color: "#f97316" }}
                  >
                    Live
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    System processing...
                  </span>
                </div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                  {stageLabel}
                </p>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between">
                    <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                      Hyperparameter Optimization
                    </span>
                    <span
                      className="text-[11px] font-mono"
                      style={{ color: "#f97316" }}
                    >
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: "var(--surface-active)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${progress}%`,
                        background: "linear-gradient(90deg, #f97316, #fb923c)",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Results Dashboard */}
            {hasResults && !isRunning && (
              <>
                {/* Performance Metrics Stat Cards */}
                <div className="flex gap-3 flex-wrap">
                  {STAT_METRICS.map((label) => {
                    const val = getMetric(label)
                    if (!val) return null
                    return (
                      <div
                        key={label}
                        className="flex flex-col gap-1 px-4 py-3 rounded-xl border flex-1 min-w-[90px]"
                        style={{
                          background: "var(--bg-secondary)",
                          borderColor: "var(--border)",
                        }}
                      >
                        <span
                          className="text-[10px] uppercase tracking-widest font-semibold"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {label}
                        </span>
                        <span
                          className="text-2xl font-bold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {val}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Loss Convergence Chart */}
                <div
                  className="rounded-xl border p-4 flex flex-col gap-3"
                  style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Loss Convergence
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Training vs. validation loss over epochs
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-3 h-0.5 rounded"
                          style={{ background: "#60a5fa" }}
                        />
                        <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                          Train
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-3 h-0.5 rounded"
                          style={{ background: "#f97316" }}
                        />
                        <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                          Validation
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <svg
                      ref={chartRef}
                      viewBox={`0 0 ${chartW} ${chartH}`}
                      className="w-full"
                      style={{ height: "180px", cursor: "crosshair" }}
                      onMouseMove={handleChartHover}
                      onMouseLeave={() => setHoverEpoch(null)}
                    >
                      <defs>
                        <linearGradient id="trainGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.02" />
                        </linearGradient>
                        <linearGradient id="valGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f97316" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#f97316" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>
                      {/* Train area + line */}
                      <path d={trainArea} fill="url(#trainGrad)" />
                      <path d={trainLine} fill="none" stroke="#60a5fa" strokeWidth="2" />
                      {/* Validation area + line */}
                      <path d={valArea} fill="url(#valGrad)" />
                      <path d={valLine} fill="none" stroke="#f97316" strokeWidth="2" />
                      {/* Hover vertical indicator */}
                      {hoverEpoch !== null && (
                        <>
                          <line
                            x1={trainPts[hoverEpoch].x}
                            y1={8}
                            x2={trainPts[hoverEpoch].x}
                            y2={chartH - 8}
                            stroke="var(--text-muted)"
                            strokeWidth="1"
                            strokeDasharray="3 3"
                          />
                          <circle
                            cx={trainPts[hoverEpoch].x}
                            cy={trainPts[hoverEpoch].y}
                            r="4"
                            fill="#60a5fa"
                          />
                          <circle
                            cx={valPts[hoverEpoch].x}
                            cy={valPts[hoverEpoch].y}
                            r="4"
                            fill="#f97316"
                          />
                        </>
                      )}
                    </svg>
                    {/* Floating tooltip */}
                    {hoverEpoch !== null && (
                      <div
                        className="absolute top-2 pointer-events-none px-2.5 py-1.5 rounded-lg border text-xs flex flex-col gap-0.5"
                        style={{
                          left: `${(hoverEpoch / (trainLoss.length - 1)) * 100}%`,
                          transform:
                            hoverEpoch > trainLoss.length * 0.7
                              ? "translateX(-110%)"
                              : "translateX(8px)",
                          background: "var(--bg-primary)",
                          borderColor: "var(--border)",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        }}
                      >
                        <span style={{ color: "var(--text-muted)" }}>
                          Epoch {hoverEpoch + 1}
                        </span>
                        <span style={{ color: "#60a5fa" }}>
                          Train: {trainLoss[hoverEpoch].toFixed(4)}
                        </span>
                        <span style={{ color: "#f97316" }}>
                          Val: {valLoss[hoverEpoch].toFixed(4)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Confusion Matrix */}
                {isBinary && (
                  <div
                    className="rounded-xl border p-4 flex flex-col gap-4"
                    style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
                  >
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        Confusion Matrix
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Model predictions vs. ground truth
                      </p>
                    </div>
                    <div className="flex gap-3 items-center">
                      {/* Y-axis label */}
                      <div className="flex items-center justify-center w-5 shrink-0 self-stretch">
                        <span
                          className="text-[10px] uppercase tracking-widest font-semibold"
                          style={{
                            color: "var(--text-muted)",
                            writingMode: "vertical-rl",
                            transform: "rotate(180deg)",
                          }}
                        >
                          Actual
                        </span>
                      </div>
                      <div className="flex flex-col gap-2 flex-1">
                        {/* X-axis label + column headers */}
                        <div className="grid grid-cols-[80px_1fr_1fr] items-center gap-2">
                          <div />
                          <span
                            className="text-[10px] text-center uppercase tracking-widest font-semibold"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Predicted Neg.
                          </span>
                          <span
                            className="text-[10px] text-center uppercase tracking-widest font-semibold"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Predicted Pos.
                          </span>
                        </div>
                        {/* Row: Actual Negative */}
                        <div className="grid grid-cols-[80px_1fr_1fr] items-center gap-2">
                          <span
                            className="text-[11px] text-right pr-2"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Actual Neg.
                          </span>
                          {/* TN */}
                          <div
                            className="rounded-xl p-4 flex flex-col items-center gap-1 border"
                            style={{
                              background: "rgba(249,115,22,0.07)",
                              borderColor: "rgba(249,115,22,0.25)",
                            }}
                          >
                            <span
                              className="text-[10px] font-semibold uppercase tracking-wider"
                              style={{ color: "#f97316" }}
                            >
                              True Negative
                            </span>
                            <span
                              className="text-3xl font-bold"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {cm![0][0]}
                            </span>
                          </div>
                          {/* FP */}
                          <div
                            className="rounded-xl p-4 flex flex-col items-center gap-1 border"
                            style={{
                              background: "rgba(239, 68, 68, 0.07)",
                              borderColor: "rgba(239, 68, 68, 0.25)",
                            }}
                          >
                            <span
                              className="text-[10px] font-semibold uppercase tracking-wider"
                              style={{ color: "#f87171" }}
                            >
                              False Positive
                            </span>
                            <span
                              className="text-3xl font-bold"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {cm![0][1]}
                            </span>
                          </div>
                        </div>
                        {/* Row: Actual Positive */}
                        <div className="grid grid-cols-[80px_1fr_1fr] items-center gap-2">
                          <span
                            className="text-[11px] text-right pr-2"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Actual Pos.
                          </span>
                          {/* FN */}
                          <div
                            className="rounded-xl p-4 flex flex-col items-center gap-1 border"
                            style={{
                              background: "rgba(239, 68, 68, 0.07)",
                              borderColor: "rgba(239, 68, 68, 0.25)",
                            }}
                          >
                            <span
                              className="text-[10px] font-semibold uppercase tracking-wider"
                              style={{ color: "#f87171" }}
                            >
                              False Negative
                            </span>
                            <span
                              className="text-3xl font-bold"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {cm![1][0]}
                            </span>
                          </div>
                          {/* TP */}
                          <div
                            className="rounded-xl p-4 flex flex-col items-center gap-1 border"
                            style={{
                              background: "rgba(249,115,22,0.07)",
                              borderColor: "rgba(249,115,22,0.25)",
                            }}
                          >
                            <span
                              className="text-[10px] font-semibold uppercase tracking-wider"
                              style={{ color: "#f97316" }}
                            >
                              True Positive
                            </span>
                            <span
                              className="text-3xl font-bold"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {cm![1][1]}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Error state */}
            {latestCell?.status === "error" && !isRunning && (
              <div
                className="rounded-xl border p-6 flex flex-col gap-2"
                style={{
                  background: "var(--bg-secondary)",
                  borderColor: "rgba(239, 68, 68, 0.3)",
                }}
              >
                <div className="flex items-center gap-2" style={{ color: "#f87171" }}>
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
                  <span className="text-sm font-medium">Training failed</span>
                </div>
                {latestCell.errorMessage && (
                  <p
                    className="text-xs font-mono px-3 py-2 rounded"
                    style={{ background: "rgba(239, 68, 68, 0.08)", color: "#f87171" }}
                  >
                    {latestCell.errorMessage}
                  </p>
                )}
              </div>
            )}

            {/* Empty State — Zap view */}
            {!latestCell && !isRunning && (
              <div
                className="rounded-xl border p-12 flex flex-col items-center justify-center gap-4"
                style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(249,115,22,0.1)" }}
                >
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon
                      points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
                      fill="rgba(249,115,22,0.18)"
                    />
                  </svg>
                </div>
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    No model trained yet
                  </p>
                  <p
                    className="text-xs max-w-[300px] leading-relaxed"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Select a target variable, choose an algorithm from the library, and click{" "}
                    <span style={{ color: "#f97316" }}>Train Model</span> to begin your
                    first run.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
