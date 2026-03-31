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

const RUN_MODES = ["training"]

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

      {/* Run-based modes (training, comparison) */}
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
