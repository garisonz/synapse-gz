"use client"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ComparisonConfig } from "@/hooks/useToolboxState"

const MODELS = [
  "XGBoost",
  "Random Forest",
  "Logistic Regression",
  "Linear Regression",
  "SVM",
  "K-Nearest Neighbors",
  "Neural Network",
]

const METRICS = [
  "Accuracy",
  "F1 Score",
  "Precision",
  "Recall",
  "RMSE",
  "MAE",
  "R² Score",
]

interface ComparisonConfigProps {
  columns: string[]
  value: ComparisonConfig
  onChange: (c: ComparisonConfig) => void
}

export function ComparisonConfig({ columns, value, onChange }: ComparisonConfigProps) {
  const toggle = (model: string) => {
    const selected = value.selectedModels.includes(model)
      ? value.selectedModels.filter((m) => m !== model)
      : [...value.selectedModels, model]
    onChange({ ...value, selectedModels: selected })
  }

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
          Models to Compare
        </Label>
        <ScrollArea
          className="max-h-40 rounded-md border"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="p-2 flex flex-col gap-0.5">
            {MODELS.map((model) => {
              const isChecked = value.selectedModels.includes(model)
              return (
                <div
                  key={model}
                  className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors"
                  style={{
                    background: isChecked ? "var(--surface-active)" : "transparent",
                  }}
                  onClick={() => toggle(model)}
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggle(model)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span
                    className="text-sm select-none"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {model}
                  </span>
                </div>
              )
            })}
          </div>
        </ScrollArea>
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
          Primary Metric
        </Label>
        <Select
          value={value.primaryMetric}
          onValueChange={(v) => onChange({ ...value, primaryMetric: v })}
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
            {METRICS.map((metric) => (
              <SelectItem key={metric} value={metric}>
                {metric}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
