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

function formatDate(iso: string) {
  return new Date(iso).toLocaleString()
}

function MetricBadges({ metrics }: { metrics: HistoryMetric[] }) {
  return (
    <div className="flex gap-2 flex-wrap mt-1">
      {metrics.map((m, i) => (
        <span
          key={i}
          className="text-xs px-2 py-0.5 rounded"
          style={{ background: "var(--surface-active)", color: "var(--text-secondary)" }}
        >
          {m.label}: <strong style={{ color: "var(--text-primary)" }}>{m.value}</strong>
        </span>
      ))}
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="p-4 rounded-lg border flex flex-col gap-1"
      style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
    >
      {children}
    </div>
  )
}

function Meta({ children }: { children: React.ReactNode }) {
  return <p className="text-xs" style={{ color: "var(--text-muted)" }}>{children}</p>
}

function Title({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{children}</p>
}

function EmptyState() {
  return (
    <p className="text-sm text-center py-12" style={{ color: "var(--text-muted)" }}>
      No records yet. Run some analyses to see history here.
    </p>
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
            className="text-sm px-4 pb-2 transition-colors"
            style={{
              color: tab === t.key ? "var(--text-primary)" : "var(--text-muted)",
              borderBottom: tab === t.key ? "2px solid var(--text-primary)" : "2px solid transparent",
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
          <p className="text-sm text-center py-12" style={{ color: "var(--text-muted)" }}>
            Loading...
          </p>
        ) : error ? (
          <p className="text-sm text-center py-12" style={{ color: "#f87171" }}>
            {error}
          </p>
        ) : (
          <div className="flex flex-col gap-3 max-w-3xl">
            {tab === "uploads" && (
              uploads.length === 0 ? <EmptyState /> :
              uploads.map((r) => (
                <Row key={r.id}>
                  <Title>{r.filename}</Title>
                  <Meta>{r.rows} rows · {r.columns} columns · {formatDate(r.created_at)}</Meta>
                  <MetricBadges metrics={r.metrics} />
                </Row>
              ))
            )}
            {tab === "eda" && (
              eda.length === 0 ? <EmptyState /> :
              eda.map((r) => (
                <Row key={r.id}>
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
              features.length === 0 ? <EmptyState /> :
              features.map((r) => (
                <Row key={r.id}>
                  <Title>{r.method}{r.impute_strategy ? ` + ${r.impute_strategy} imputation` : ""}</Title>
                  <Meta>{r.columns_used.length} columns · {formatDate(r.created_at)}</Meta>
                  <MetricBadges metrics={r.metrics} />
                </Row>
              ))
            )}
            {tab === "training" && (
              training.length === 0 ? <EmptyState /> :
              training.map((r) => (
                <Row key={r.id}>
                  <Title>{r.model_name} · {r.task_type}</Title>
                  <Meta>
                    Target: {r.target_column} · Test split: {Math.round(r.test_split * 100)}% · {formatDate(r.created_at)}
                  </Meta>
                  <MetricBadges metrics={r.metrics} />
                </Row>
              ))
            )}
            {tab === "comparisons" && (
              comparisons.length === 0 ? <EmptyState /> :
              comparisons.map((r) => (
                <Row key={r.id}>
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
