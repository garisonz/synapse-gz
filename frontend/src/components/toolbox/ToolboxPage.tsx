"use client"

import { useToolboxState } from "@/hooks/useToolboxState"
import { ConfigPanel } from "./ConfigPanel"
import { NotebookPanel } from "./NotebookPanel"

export function ToolboxPage() {
  const {
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
  } = useToolboxState()

  return (
    <div
      className="flex flex-col flex-1 overflow-hidden"
      style={
        {
          "--bg-primary": "#ffffff",
          "--bg-secondary": "#f8f9fa",
          "--surface-hover": "#f1f3f5",
          "--surface-active": "#e9ecef",
          "--border": "#dee2e6",
          "--text-primary": "#1a1a2e",
          "--text-secondary": "#495057",
          "--text-muted": "#adb5bd",
          background: "var(--bg-primary)",
          color: "var(--text-primary)",
        } as React.CSSProperties
      }
    >
      {/* Header */}
      <header
        className="px-4 py-3 shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <h1
          className="text-sm font-semibold tracking-wide"
          style={{ color: "var(--text-primary)" }}
        >
          Toolbox
        </h1>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <ConfigPanel
          mode={mode}
          onModeChange={setMode}
          columns={columns}
          hasFile={!!file}
          isRunning={isRunning}
          onRun={handleRun}
          edaConfig={edaConfig}
          onEdaConfigChange={setEdaConfig}
          featureConfig={featureConfig}
          onFeatureConfigChange={setFeatureConfig}
          trainingConfig={trainingConfig}
          onTrainingConfigChange={setTrainingConfig}
          comparisonConfig={comparisonConfig}
          onComparisonConfigChange={setComparisonConfig}
        />
        <NotebookPanel
          file={file}
          parsedRows={parsedRows}
          cells={cells}
          onFileChange={handleFileChange}
          onRemove={handleRemove}
          onDeleteCell={handleDeleteCell}
        />
      </div>
    </div>
  )
}
