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
import type { FeatureConfig } from "@/hooks/useToolboxState"

const METHODS = [
  "Auto",
  "One-Hot Encoding",
  "Label Encoding",
  "Binning",
  "Log Transform",
  "Polynomial Features",
  "Interaction Terms",
]

const IMPUTE_STRATEGIES = [
  { label: "None", value: "none" },
  { label: "KNN Imputer", value: "knn" },
  { label: "Mean", value: "mean" },
  { label: "Median", value: "median" },
  { label: "Mode", value: "mode" },
]

interface FeatureConfigProps {
  columns: string[]
  value: FeatureConfig
  onChange: (c: FeatureConfig) => void
}

export function FeatureConfig({ columns, value, onChange }: FeatureConfigProps) {
  const toggle = (col: string) => {
    const selected = value.columns.includes(col)
      ? value.columns.filter((c) => c !== col)
      : [...value.columns, col]
    onChange({ ...value, columns: selected })
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
          Columns
        </Label>
        <ScrollArea
          className="max-h-40 rounded-md border"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="p-2 flex flex-col gap-0.5">
            {columns.map((col) => {
              const isChecked = value.columns.includes(col)
              return (
                <div
                  key={col}
                  className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors"
                  style={{
                    background: isChecked ? "var(--surface-active)" : "transparent",
                  }}
                  onClick={() => toggle(col)}
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggle(col)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span
                    className="text-sm select-none"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {col}
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
          Method
        </Label>
        <Select
          value={value.method}
          onValueChange={(v) => onChange({ ...value, method: v })}
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
            {METHODS.map((method) => (
              <SelectItem key={method} value={method}>
                {method}
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
          Impute Missing Values
        </Label>
        <Select
          value={value.imputeStrategy}
          onValueChange={(v) => onChange({ ...value, imputeStrategy: v })}
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
            {IMPUTE_STRATEGIES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
