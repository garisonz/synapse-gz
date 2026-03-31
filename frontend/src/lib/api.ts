import { getAccessToken } from "./auth"

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api`

export interface HistoryMetric {
  label: string
  value: string | number
}

export interface UploadRecord {
  id: number
  filename: string
  rows: number
  columns: number
  metrics: HistoryMetric[]
  created_at: string
}

export interface EDARecord {
  id: number
  dataset_id: number | null
  analyses: string[]
  target_column: string | null
  metrics: HistoryMetric[]
  created_at: string
}

export interface FeatureRecord {
  id: number
  dataset_id: number | null
  method: string
  columns_used: string[]
  impute_strategy: string | null
  metrics: HistoryMetric[]
  created_at: string
}

export interface TrainingRecord {
  id: number
  dataset_id: number | null
  model_name: string
  task_type: string
  target_column: string
  test_split: number
  metrics: HistoryMetric[]
  created_at: string
}

export interface ComparisonRecord {
  id: number
  dataset_id: number | null
  task_type: string
  target_column: string
  models_used: string[]
  winner: string
  metrics: HistoryMetric[]
  created_at: string
}

async function historyFetch<T>(path: string): Promise<T> {
  const token = getAccessToken()
  const res = await fetch(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) throw new Error(`Failed to fetch ${path}`)
  return res.json()
}

export const historyApi = {
  uploads: () => historyFetch<UploadRecord[]>("/history/uploads"),
  eda: () => historyFetch<EDARecord[]>("/history/eda"),
  features: () => historyFetch<FeatureRecord[]>("/history/features"),
  training: () => historyFetch<TrainingRecord[]>("/history/training"),
  comparisons: () => historyFetch<ComparisonRecord[]>("/history/comparisons"),
}
