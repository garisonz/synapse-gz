"use client"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { TrainingConfig } from "@/hooks/useToolboxState"

const MODELS = [
  "XGBoost",
  "Random Forest",
  "Logistic Regression",
  "Linear Regression",
  "SVM",
  "K-Nearest Neighbors",
  "Neural Network",
]

interface TrainingConfigProps {
  columns: string[]
  value: TrainingConfig
  onChange: (c: TrainingConfig) => void
}

export function TrainingConfig({ columns, value, onChange }: TrainingConfigProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label
          style={{
            color: "var(--text-secondary)",
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Target Column
        </Label>
        <Select
          value={value.targetColumn || undefined}
          onValueChange={(v) => onChange({ ...value, targetColumn: v })}
        >
          <SelectTrigger
            className="h-8 text-sm"
            style={{
              background: "var(--surface-active)",
              borderColor: "var(--border)",
              color: "var(--text-primary)",
            }}
          >
            <SelectValue placeholder="Select target..." />
          </SelectTrigger>
          <SelectContent>
            {columns.map((col) => (
              <SelectItem key={col} value={col}>
                {col}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label
          style={{
            color: "var(--text-secondary)",
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Task Type
        </Label>
        <Select
          value={value.taskType}
          onValueChange={(v) => onChange({ ...value, taskType: v })}
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
            {["Auto-detect", "Classification", "Regression"].map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label
          style={{
            color: "var(--text-secondary)",
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Model
        </Label>
        <Select
          value={value.model}
          onValueChange={(v) => onChange({ ...value, model: v })}
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
            {MODELS.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label
          style={{
            color: "var(--text-secondary)",
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Test Split
        </Label>
        <Select
          value={value.testSplit}
          onValueChange={(v) => onChange({ ...value, testSplit: v })}
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
  )
}
