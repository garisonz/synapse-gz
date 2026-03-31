"use client"

import React, { useEffect, useState } from "react"
import {
  historyApi,
  UploadRecord,
  EDARecord,
  FeatureRecord,
  TrainingRecord,
  ComparisonRecord,
  HistoryMetric,
} from "@/lib/api"

type Tab = "uploads" | "eda" | "features" | "training" | "comparisons"

const TABS: { key: Tab; label: string }[] = [
  { key: "uploads", label: "Uploads" },
  { key: "eda", label: "EDA" },
  { key: "features", label: "Features" },
  { key: "training", label: "Training" },
  { key: "comparisons", label: "Comparisons" },
]

const TAB_COLORS: Record<Tab, string> = {
  uploads: "#60a5fa",
  eda: "#8b5cf6",
  features: "#a78bfa",
  training: "#f97316",
  comparisons: "#fbbf24",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString()
}

function MetricBadges({ metrics }: { metrics: HistoryMetric[] }) {
  return (
    <div className="flex gap-1.5 flex-wrap mt-1">
      {metrics.map((m, i) => (
        <span
          key={i}
          className="text-[11px] px-2 py-0.5 rounded-full font-mono"
          style={{ background: "var(--surface-active)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
        >
          {m.label}: <strong style={{ color: "var(--text-primary)" }}>{m.value}</strong>
        </span>
      ))}
    </div>
  )
}

function Row({ children, accentColor }: { children: React.ReactNode; accentColor: string }) {
  return (
    <div
      className="p-4 rounded-xl border flex flex-col gap-1 transition-all"
      style={{
        borderColor: "var(--border)",
        background: "var(--bg-secondary)",
        borderLeft: `3px solid ${accentColor}`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = "var(--surface-hover)"
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background = "var(--bg-secondary)"
      }}
    >
      {children}
    </div>
  )
}

function Meta({ children }: { children: React.ReactNode }) {
  return <p className="text-xs" style={{ color: "var(--text-muted)" }}>{children}</p>
}

function Title({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{children}</p>
}

function EmptyState({ tab }: { tab: Tab }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: `${TAB_COLORS[tab]}18`, border: `1px solid ${TAB_COLORS[tab]}30` }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={TAB_COLORS[tab]} strokeWidth="1.5">
          <circle cx="12" cy="12" r="9" />
          <polyline points="12 7 12 12 15 15" />
        </svg>
      </div>
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>No records yet</p>
        <p className="text-xs max-w-[220px]" style={{ color: "var(--text-muted)" }}>
          Run some analyses to see your history here.
        </p>
      </div>
    </div>
  )
}

export function HistoryPanel() {
  const [tab, setTab] = useState<Tab>("uploads")
  const [uploads, setUploads] = useState<UploadRecord[]>([])
  const [eda, setEda] = useState<EDARecord[]>([])
  const [features, setFeatures] = useState<FeatureRecord[]>([])
  const [training, setTraining] = useState<TrainingRecord[]>([])
  const [comparisons, setComparisons] = useState<ComparisonRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([
      historyApi.uploads(),
      historyApi.eda(),
      historyApi.features(),
      historyApi.training(),
      historyApi.comparisons(),
    ])
      .then(([u, e, f, t, c]) => {
        setUploads(u)
        setEda(e)
        setFeatures(f)
        setTraining(t)
        setComparisons(c)
      })
      .catch(() => setError("Could not load history. Make sure you are logged in."))
      .finally(() => setLoading(false))
  }, [])

  const accent = TAB_COLORS[tab]

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      {/* Tabs */}
      <div
        className="flex gap-0 shrink-0 px-4 pt-3"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            className="text-sm px-4 pb-2.5 transition-all"
            style={{
              color: tab === t.key ? TAB_COLORS[t.key] : "var(--text-muted)",
              borderBottom: tab === t.key ? `2px solid ${TAB_COLORS[t.key]}` : "2px solid transparent",
              fontWeight: tab === t.key ? 600 : 400,
            }}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              <span className="text-sm">Loading history...</span>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-sm text-center" style={{ color: "#f87171" }}>{error}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 max-w-3xl">
            {tab === "uploads" && (
              uploads.length === 0 ? <EmptyState tab={tab} /> :
              uploads.map((r) => (
                <Row key={r.id} accentColor={accent}>
                  <Title>{r.filename}</Title>
                  <Meta>{r.rows.toLocaleString()} rows · {r.columns} columns · {formatDate(r.created_at)}</Meta>
                  <MetricBadges metrics={r.metrics} />
                </Row>
              ))
            )}
            {tab === "eda" && (
              eda.length === 0 ? <EmptyState tab={tab} /> :
              eda.map((r) => (
                <Row key={r.id} accentColor={accent}>
                  <Title>EDA — {r.analyses.join(", ")}</Title>
                  <Meta>
                    {r.target_column ? `Target: ${r.target_column} · ` : ""}
                    {formatDate(r.created_at)}
                  </Meta>
                  <MetricBadges metrics={r.metrics} />
                </Row>
              ))
            )}
            {tab === "features" && (
              features.length === 0 ? <EmptyState tab={tab} /> :
              features.map((r) => (
                <Row key={r.id} accentColor={accent}>
                  <Title>{r.method}{r.impute_strategy ? ` + ${r.impute_strategy} imputation` : ""}</Title>
                  <Meta>{r.columns_used.length} columns · {formatDate(r.created_at)}</Meta>
                  <MetricBadges metrics={r.metrics} />
                </Row>
              ))
            )}
            {tab === "training" && (
              training.length === 0 ? <EmptyState tab={tab} /> :
              training.map((r) => (
                <Row key={r.id} accentColor={accent}>
                  <Title>{r.model_name} · {r.task_type}</Title>
                  <Meta>
                    Target: {r.target_column} · Test split: {Math.round(r.test_split * 100)}% · {formatDate(r.created_at)}
                  </Meta>
                  <MetricBadges metrics={r.metrics} />
                </Row>
              ))
            )}
            {tab === "comparisons" && (
              comparisons.length === 0 ? <EmptyState tab={tab} /> :
              comparisons.map((r) => (
                <Row key={r.id} accentColor={accent}>
                  <Title>Winner: {r.winner} · {r.task_type}</Title>
                  <Meta>
                    Target: {r.target_column} · Models: {r.models_used.join(", ")} · {formatDate(r.created_at)}
                  </Meta>
                  <MetricBadges metrics={r.metrics} />
                </Row>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
