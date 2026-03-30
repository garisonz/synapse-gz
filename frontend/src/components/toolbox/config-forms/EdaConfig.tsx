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
import type { EdaConfig } from "@/hooks/useToolboxState"

const ANALYSES: { label: string; visual: boolean }[] = [
  { label: "Summary Statistics", visual: false },
  { label: "Missing Values", visual: false },
  { label: "Outlier Detection", visual: false },
  { label: "Distribution", visual: true },
  { label: "Correlation", visual: true },
  { label: "Box Plot", visual: true },
  { label: "Scatter Matrix", visual: true },
  { label: "Bar Chart", visual: true },
]

interface EdaConfigProps {
  columns: string[]
  value: EdaConfig
  onChange: (c: EdaConfig) => void
}

export function EdaConfig({ columns, value, onChange }: EdaConfigProps) {
  const toggle = (label: string) => {
    const analyses = value.analyses.includes(label)
      ? value.analyses.filter((a) => a !== label)
      : [...value.analyses, label]
    onChange({ ...value, analyses })
  }

  const metrics = ANALYSES.filter((a) => !a.visual)
  const visuals = ANALYSES.filter((a) => a.visual)

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
          Target Column (optional)
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
            <SelectValue placeholder="None" />
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

      <div className="flex flex-col gap-3">
        {/* Metrics */}
        <div className="flex flex-col gap-1.5">
          <Label
            style={{
              color: "var(--text-secondary)",
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Metrics
          </Label>
          <div
            className="rounded-md border p-2 flex flex-col gap-0.5"
            style={{ borderColor: "var(--border)" }}
          >
            {metrics.map(({ label }) => {
              const isChecked = value.analyses.includes(label)
              return (
                <div
                  key={label}
                  className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors"
                  style={{ background: isChecked ? "var(--surface-active)" : "transparent" }}
                  onClick={() => toggle(label)}
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggle(label)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-sm select-none" style={{ color: "var(--text-primary)" }}>
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Visuals */}
        <div className="flex flex-col gap-1.5">
          <Label
            style={{
              color: "var(--text-secondary)",
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Visuals
          </Label>
          <div
            className="rounded-md border p-2 flex flex-col gap-0.5"
            style={{ borderColor: "var(--border)" }}
          >
            {visuals.map(({ label }) => {
              const isChecked = value.analyses.includes(label)
              return (
                <div
                  key={label}
                  className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors"
                  style={{ background: isChecked ? "var(--surface-active)" : "transparent" }}
                  onClick={() => toggle(label)}
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggle(label)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-sm select-none" style={{ color: "var(--text-primary)" }}>
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
