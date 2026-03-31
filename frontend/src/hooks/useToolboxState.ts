"use client"

import { useState } from "react"
import { useCsvParser } from "./useCsvParser"
import { getAccessToken } from "@/lib/auth"

export type CellStatus = "running" | "complete" | "error"
export type Metric = { label: string; value: string | number }
export type NotebookCellData = {
  id: string
  mode: string
  status: CellStatus
  timestamp: string
  configSummary: string
  metrics: Metric[] | null
  plots: string[]
  errorMessage?: string
}

export const MODE_LABELS: Record<string, string> = {
  eda: "Auto EDA",
  feature: "Feature Engineering",
  training: "Model Training",
}

export type EdaConfig = { analyses: string[]; targetColumn: string }
export type FeatureConfig = {
  columns: string[]
  method: string
  imputeStrategy: string
}
export type TrainingConfig = {
  targetColumn: string
  taskType: string
  model: string
  testSplit: string
}

const ANALYSIS_KEY: Record<string, string> = {
  Distribution: "distribution",
  Correlation: "correlation",
  "Missing Values": "missing",
  "Outlier Detection": "outliers",
  "Summary Statistics": "summary",
  "Box Plot": "box_plot",
  "Scatter Matrix": "scatter",
  "Bar Chart": "bar_chart",
}

const MODEL_KEY: Record<string, string> = {
  XGBoost: "xgboost",
  "Random Forest": "random_forest",
  "Logistic Regression": "logistic_regression",
  "Linear Regression": "random_forest",
  SVM: "svm",
  "K-Nearest Neighbors": "knn",
  "Neural Network": "neural_network",
}

const METHOD_KEY: Record<string, string> = {
  Auto: "standard",
  "One-Hot Encoding": "onehot",
  "Label Encoding": "label",
  "Log Transform": "log",
  "Polynomial Features": "polynomial",
  Binning: "standard",
  "Interaction Terms": "polynomial",
}

const TASK_MAP: Record<string, string> = {
  "Auto-detect": "classification",
  Classification: "classification",
  Regression: "regression",
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

function authHeaders(): Record<string, string> {
  const token = getAccessToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function useToolboxState() {
  const {
    file,
    parsedRows,
    columns,
    handleFileChange: csvHandleFileChange,
    handleRemove: csvHandleRemove,
  } = useCsvParser()

  const [mode, setMode] = useState("upload")
  const [cells, setCells] = useState<NotebookCellData[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [datasetId, setDatasetId] = useState<number | null>(null)

  const [edaConfig, setEdaConfig] = useState<EdaConfig>({
    analyses: ["Distribution", "Correlation", "Missing Values"],
    targetColumn: "",
  })
  const [featureConfig, setFeatureConfig] = useState<FeatureConfig>({
    columns: [],
    method: "Auto",
    imputeStrategy: "none",
  })
  const [trainingConfig, setTrainingConfig] = useState<TrainingConfig>({
    targetColumn: "",
    taskType: "Auto-detect",
    model: "XGBoost",
    testSplit: "20%",
  })
  // Upload file to the backend for DB recording; returns dataset id if authenticated
  const uploadFile = async (f: File): Promise<void> => {
    const token = getAccessToken()
    if (!token) return
    try {
      const fd = new FormData()
      fd.append("file", f)
      const res = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: fd,
        headers: authHeaders(),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.id) setDatasetId(data.id)
      }
    } catch {
      // Non-critical — upload recording failure should not block analysis
    }
  }

  const handleFileChange = (f: File) => {
    csvHandleFileChange(f)
    uploadFile(f)
  }

  const buildFormData = (): FormData | null => {
    if (!file) return null
    const fd = new FormData()
    fd.append("file", file)

    if (mode === "eda") {
      const mapped = edaConfig.analyses.map((a) => ANALYSIS_KEY[a] ?? a.toLowerCase())
      fd.append("analyses", JSON.stringify(mapped))
      if (edaConfig.targetColumn) fd.append("target_column", edaConfig.targetColumn)
    } else if (mode === "feature") {
      fd.append("columns", JSON.stringify(featureConfig.columns))
      fd.append("method", METHOD_KEY[featureConfig.method] ?? "standard")
      if (featureConfig.imputeStrategy && featureConfig.imputeStrategy !== "none") {
        fd.append("impute_strategy", featureConfig.imputeStrategy)
      }
    } else if (mode === "training") {
      if (!trainingConfig.targetColumn) return null
      fd.append("target_column", trainingConfig.targetColumn)
      fd.append("task_type", TASK_MAP[trainingConfig.taskType] ?? "classification")
      fd.append("model", MODEL_KEY[trainingConfig.model] ?? "random_forest")
      fd.append("test_split", String(parseInt(trainingConfig.testSplit) / 100))
    }
    return fd
  }

  const getEndpoint = (): string => {
    const map: Record<string, string> = {
      eda: "/api/eda",
      feature: "/api/features",
      training: "/api/train",
    }
    return API_URL + (map[mode] ?? "/api/eda")
  }

  const handleRun = async () => {
    if (!file) return
    const fd = buildFormData()
    if (!fd) return

    const id = crypto.randomUUID()
    const newCell: NotebookCellData = {
      id,
      mode,
      status: "running",
      timestamp: new Date().toLocaleTimeString(),
      configSummary: `${MODE_LABELS[mode] ?? mode} on ${file.name}`,
      metrics: null,
      plots: [],
    }
    setCells((prev) => [...prev, newCell])
    setIsRunning(true)

    try {
      const res = await fetch(getEndpoint(), {
        method: "POST",
        body: fd,
        headers: authHeaders(),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Request failed" }))
        throw new Error(err.detail ?? "Request failed")
      }
      const data = await res.json()
      setCells((prev) =>
        prev.map((cell) =>
          cell.id === id
            ? {
                ...cell,
                status: "complete" as CellStatus,
                metrics: data.metrics ?? [],
                plots: data.plots ?? [],
              }
            : cell
        )
      )
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Request failed"
      setCells((prev) =>
        prev.map((cell) =>
          cell.id === id
            ? { ...cell, status: "error" as CellStatus, errorMessage }
            : cell
        )
      )
    } finally {
      setIsRunning(false)
    }
  }

  const handleDeleteCell = (id: string) => {
    setCells((prev) => prev.filter((cell) => cell.id !== id))
  }

  const handleRemove = () => {
    csvHandleRemove()
    setCells([])
    setDatasetId(null)
  }

  return {
    file,
    parsedRows,
    columns,
    mode,
    setMode,
    cells,
    isRunning,
    datasetId,
    handleFileChange,
    handleRun,
    handleDeleteCell,
    handleRemove,
    edaConfig,
    setEdaConfig,
    featureConfig,
    setFeatureConfig,
    trainingConfig,
    setTrainingConfig,
  }
}
