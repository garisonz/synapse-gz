"use client"

import React from "react"
import { useToolboxState } from "@/hooks/useToolboxState"
import { ModeNav } from "./ModeNav"
import { UploadPanel } from "./UploadPanel"
import { HistoryPanel } from "./HistoryPanel"
import { EdaPanel } from "./EdaPanel"
import { FeaturePanel } from "./FeaturePanel"
import { ConfigPanel } from "./ConfigPanel"
import { NotebookPanel } from "./NotebookPanel"
import { TrainingPanel } from "./TrainingPanel"

const RUN_MODES: string[] = []

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
  } = useToolboxState()

  return (
    <div
      className="flex flex-1 overflow-hidden"
      style={
        {
          "--bg-primary": "#ffffff",
          "--bg-secondary": "#f9fafb",
          "--surface-hover": "#f3f4f6",
          "--surface-active": "#e5e7eb",
          "--border": "#e5e7eb",
          "--text-primary": "#111827",
          "--text-secondary": "#4b5563",
          "--text-muted": "#9ca3af",
          background: "var(--bg-primary)",
          color: "var(--text-primary)",
        } as React.CSSProperties
      }
    >
      {/* Left mode nav */}
      <ModeNav mode={mode} onModeChange={setMode} />

      {/* Upload mode */}
      {mode === "upload" && (
        <UploadPanel
          file={file}
          parsedRows={parsedRows}
          onFileChange={handleFileChange}
          onRemove={handleRemove}
        />
      )}

      {/* History mode */}
      {mode === "history" && <HistoryPanel />}

      {/* EDA mode */}
      {mode === "eda" && <EdaPanel parsedRows={parsedRows} />}

      {/* Feature Engineering mode */}
      {mode === "feature" && <FeaturePanel parsedRows={parsedRows} />}

      {/* Model Training mode */}
      {mode === "training" && (
        <TrainingPanel
          file={file}
          parsedRows={parsedRows}
          columns={columns}
          trainingConfig={trainingConfig}
          onTrainingConfigChange={setTrainingConfig}
          isRunning={isRunning}
          onRun={handleRun}
          cells={cells}
          onFileChange={handleFileChange}
          onRemove={handleRemove}
        />
      )}

      {/* Run-based modes (comparison, etc.) */}
      {RUN_MODES.includes(mode) && (
        <>
          <ConfigPanel
            mode={mode}
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
          />
          <NotebookPanel
            file={file}
            parsedRows={parsedRows}
            cells={cells}
            onFileChange={handleFileChange}
            onRemove={handleRemove}
            onDeleteCell={handleDeleteCell}
          />
        </>
      )}
    </div>
  )
}
