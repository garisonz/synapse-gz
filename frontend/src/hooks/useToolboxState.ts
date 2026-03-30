"use client"

import { useState } from "react"
import { useCsvParser } from "./useCsvParser"

export type CellStatus = "running" | "complete" | "error"
export type Metric = { label: string; value: string | number }
export type NotebookCellData = {
  id: string
  mode: string
  status: CellStatus
  timestamp: string
  configSummary: string
  metrics: Metric[] | null
}

export const MODE_LABELS: Record<string, string> = {
  eda: "Auto EDA",
  feature: "Feature Engineering",
  training: "Model Training",
  comparison: "Comparison",
}

export type EdaConfig = { analyses: string[]; targetColumn: string }
export type FeatureConfig = { columns: string[]; method: string }
export type TrainingConfig = {
  targetColumn: string
  taskType: string
  model: string
  testSplit: string
}
export type ComparisonConfig = {
  targetColumn: string
  selectedModels: string[]
  primaryMetric: string
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

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export function useToolboxState() {
  const {
    file,
    parsedRows,
    columns,
    handleFileChange,
    handleRemove: csvHandleRemove,
  } = useCsvParser()

  const [mode, setMode] = useState("eda")
  const [cells, setCells] = useState<NotebookCellData[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const [edaConfig, setEdaConfig] = useState<EdaConfig>({
    analyses: ["Distribution", "Correlation", "Missing Values"],
    targetColumn: "",
  })
  const [featureConfig, setFeatureConfig] = useState<FeatureConfig>({
    columns: [],
    method: "Auto",
  })
  const [trainingConfig, setTrainingConfig] = useState<TrainingConfig>({
    targetColumn: "",
    taskType: "Auto-detect",
    model: "XGBoost",
    testSplit: "20%",
  })
  const [comparisonConfig, setComparisonConfig] = useState<ComparisonConfig>({
    targetColumn: "",
    selectedModels: ["XGBoost", "Random Forest"],
    primaryMetric: "Accuracy",
  })

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
    } else if (mode === "training") {
      if (!trainingConfig.targetColumn) return null
      fd.append("target_column", trainingConfig.targetColumn)
      const taskMap: Record<string, string> = {
        "Auto-detect": "classification",
        Classification: "classification",
        Regression: "regression",
      }
      fd.append("task_type", taskMap[trainingConfig.taskType] ?? "classification")
      fd.append("model", MODEL_KEY[trainingConfig.model] ?? "random_forest")
      fd.append(
        "test_split",
        String(parseInt(trainingConfig.testSplit) / 100)
      )
    } else if (mode === "comparison") {
      if (!comparisonConfig.targetColumn) return null
      fd.append("target_column", comparisonConfig.targetColumn)
      fd.append("task_type", "classification")
      const mappedModels = comparisonConfig.selectedModels.map(
        (m) => MODEL_KEY[m] ?? m.toLowerCase()
      )
      fd.append("models", JSON.stringify(mappedModels))
      fd.append(
        "primary_metric",
        comparisonConfig.primaryMetric.toLowerCase().replace(/\s+/g, "_")
      )
    }
    return fd
  }

  const getEndpoint = (): string => {
    const map: Record<string, string> = {
      eda: "/api/eda",
      feature: "/api/features",
      training: "/api/train",
      comparison: "/api/compare",
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
    }
    setCells((prev) => [...prev, newCell])
    setIsRunning(true)

    try {
      const res = await fetch(getEndpoint(), { method: "POST", body: fd })
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
              }
            : cell
        )
      )
    } catch {
      setCells((prev) =>
        prev.map((cell) =>
          cell.id === id ? { ...cell, status: "error" as CellStatus } : cell
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
  }

  return {
    file,
    parsedRows,
    columns,
    mode,
    setMode,
    cells,
    isRunning,
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
    comparisonConfig,
    setComparisonConfig,
  }
}
