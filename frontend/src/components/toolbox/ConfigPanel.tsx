"use client"

import { ModeSelector } from "./ModeSelector"
import { EdaConfig } from "./config-forms/EdaConfig"
import { FeatureConfig } from "./config-forms/FeatureConfig"
import { TrainingConfig } from "./config-forms/TrainingConfig"
import { ComparisonConfig } from "./config-forms/ComparisonConfig"
import { Button } from "@/components/ui/button"
import type {
  EdaConfig as EdaConfigType,
  FeatureConfig as FeatureConfigType,
  TrainingConfig as TrainingConfigType,
  ComparisonConfig as ComparisonConfigType,
} from "@/hooks/useToolboxState"

const MODE_LABELS: Record<string, string> = {
  eda: "Auto EDA",
  feature: "Feature Engineering",
  training: "Model Training",
  comparison: "Comparison",
}

interface ConfigPanelProps {
  mode: string
  onModeChange: (mode: string) => void
  columns: string[]
  hasFile: boolean
  isRunning: boolean
  onRun: () => void
  edaConfig: EdaConfigType
  onEdaConfigChange: (c: EdaConfigType) => void
  featureConfig: FeatureConfigType
  onFeatureConfigChange: (c: FeatureConfigType) => void
  trainingConfig: TrainingConfigType
  onTrainingConfigChange: (c: TrainingConfigType) => void
  comparisonConfig: ComparisonConfigType
  onComparisonConfigChange: (c: ComparisonConfigType) => void
}

function renderConfigForm(
  mode: string,
  columns: string[],
  props: Pick<
    ConfigPanelProps,
    | "edaConfig"
    | "onEdaConfigChange"
    | "featureConfig"
    | "onFeatureConfigChange"
    | "trainingConfig"
    | "onTrainingConfigChange"
    | "comparisonConfig"
    | "onComparisonConfigChange"
  >
) {
  switch (mode) {
    case "eda":
      return (
        <EdaConfig
          columns={columns}
          value={props.edaConfig}
          onChange={props.onEdaConfigChange}
        />
      )
    case "feature":
      return (
        <FeatureConfig
          columns={columns}
          value={props.featureConfig}
          onChange={props.onFeatureConfigChange}
        />
      )
    case "training":
      return (
        <TrainingConfig
          columns={columns}
          value={props.trainingConfig}
          onChange={props.onTrainingConfigChange}
        />
      )
    case "comparison":
      return (
        <ComparisonConfig
          columns={columns}
          value={props.comparisonConfig}
          onChange={props.onComparisonConfigChange}
        />
      )
    default:
      return null
  }
}

export function ConfigPanel({
  mode,
  onModeChange,
  columns,
  hasFile,
  isRunning,
  onRun,
  edaConfig,
  onEdaConfigChange,
  featureConfig,
  onFeatureConfigChange,
  trainingConfig,
  onTrainingConfigChange,
  comparisonConfig,
  onComparisonConfigChange,
}: ConfigPanelProps) {
  return (
    <div
      className="w-[300px] flex flex-col shrink-0 overflow-hidden"
      style={{
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border)",
      }}
    >
      {/* Mode selector */}
      <div style={{ borderBottom: "1px solid var(--border)" }}>
        <div
          className="px-4 pt-3 pb-1 text-[10px] font-semibold tracking-widest uppercase"
          style={{ color: "var(--text-muted)" }}
        >
          Mode
        </div>
        <ModeSelector mode={mode} onModeChange={onModeChange} />
      </div>

      {/* Config form */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        <div
          className="text-[10px] font-semibold tracking-widest uppercase"
          style={{ color: "var(--text-muted)" }}
        >
          {MODE_LABELS[mode] ?? mode} Settings
        </div>
        {!hasFile ? (
          <p className="text-sm italic" style={{ color: "var(--text-muted)" }}>
            Upload a CSV to configure settings.
          </p>
        ) : (
          renderConfigForm(mode, columns, {
            edaConfig,
            onEdaConfigChange,
            featureConfig,
            onFeatureConfigChange,
            trainingConfig,
            onTrainingConfigChange,
            comparisonConfig,
            onComparisonConfigChange,
          })
        )}
      </div>

      {/* Run button */}
      <div className="p-4 shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
        <Button
          onClick={onRun}
          disabled={!hasFile || isRunning}
          className="w-full h-9 text-sm font-medium gap-2"
          style={{
            background: "rgba(16, 185, 129, 0.15)",
            color: "#34d399",
            border: "1px solid rgba(16, 185, 129, 0.3)",
          }}
        >
          {isRunning ? (
            <>
              <svg
                className="animate-spin"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Running...
            </>
          ) : (
            `Run ${MODE_LABELS[mode] ?? mode}`
          )}
        </Button>
      </div>
    </div>
  )
}
