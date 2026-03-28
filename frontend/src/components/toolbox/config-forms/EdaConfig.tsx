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
import type { EdaConfig } from "@/hooks/useToolboxState"

const ANALYSES = [
  "Distribution",
  "Correlation",
  "Missing Values",
  "Outlier Detection",
  "Summary Statistics",
]

interface EdaConfigProps {
  columns: string[]
  value: EdaConfig
  onChange: (c: EdaConfig) => void
}

export function EdaConfig({ columns, value, onChange }: EdaConfigProps) {
  const toggle = (analysis: string) => {
    const analyses = value.analyses.includes(analysis)
      ? value.analyses.filter((a) => a !== analysis)
      : [...value.analyses, analysis]
    onChange({ ...value, analyses })
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

      <div className="flex flex-col gap-1.5">
        <Label
          style={{
            color: "var(--text-secondary)",
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Analyses
        </Label>
        <ScrollArea
          className="max-h-40 rounded-md border"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="p-2 flex flex-col gap-0.5">
            {ANALYSES.map((analysis) => {
              const isChecked = value.analyses.includes(analysis)
              return (
                <div
                  key={analysis}
                  className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors"
                  style={{
                    background: isChecked ? "var(--surface-active)" : "transparent",
                  }}
                  onClick={() => toggle(analysis)}
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggle(analysis)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span
                    className="text-sm select-none"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {analysis}
                  </span>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
