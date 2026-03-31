"use client"

import React from "react"

interface Mode {
  id: string
  label: string
  icon: React.ReactNode
}

const TOP_MODES: Mode[] = [
  {
    id: "upload",
    label: "Upload Data",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    ),
  },
  {
    id: "eda",
    label: "Auto EDA",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="10" width="3" height="5" rx="0.5" />
        <rect x="6" y="6" width="3" height="9" rx="0.5" />
        <rect x="11" y="2" width="3" height="13" rx="0.5" />
      </svg>
    ),
  },
  {
    id: "feature",
    label: "Feature Engineering",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="8" cy="8" r="6" />
        <circle cx="8" cy="8" r="2" />
        <line x1="8" y1="1" x2="8" y2="3.5" />
        <line x1="8" y1="12.5" x2="8" y2="15" />
        <line x1="1" y1="8" x2="3.5" y2="8" />
        <line x1="12.5" y1="8" x2="15" y2="8" />
      </svg>
    ),
  },
  {
    id: "training",
    label: "Model Training",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="1,13 5,9 9,11 13,5" />
        <circle cx="13" cy="5" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
]

const BOTTOM_MODES: Mode[] = [
  {
    id: "history",
    label: "Run History",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 7 12 12 15 15" />
      </svg>
    ),
  },
]

interface ModeNavProps {
  mode: string
  onModeChange: (mode: string) => void
}

function NavButton({ m, isActive, onModeChange }: { m: Mode; isActive: boolean; onModeChange: (id: string) => void }) {
  return (
    <button
      key={m.id}
      onClick={() => onModeChange(m.id)}
      title={m.label}
      className="flex items-center justify-center mx-1 my-0.5 rounded-md transition-colors"
      style={{
        height: "36px",
        background: isActive ? "var(--surface-active)" : "transparent",
        color: isActive ? "var(--text-primary)" : "var(--text-muted)",
        border: isActive ? "1px solid var(--border)" : "1px solid transparent",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "var(--surface-hover)"
          e.currentTarget.style.color = "var(--text-primary)"
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = "transparent"
          e.currentTarget.style.color = "var(--text-muted)"
        }
      }}
    >
      {m.icon}
    </button>
  )
}

export function ModeNav({ mode, onModeChange }: ModeNavProps) {
  return (
    <nav
      className="flex flex-col shrink-0 py-2"
      style={{
        width: "52px",
        background: "var(--bg-secondary)",
        borderRight: "1px solid var(--border)",
      }}
    >
      {/* Top modes */}
      <div className="flex flex-col flex-1">
        {TOP_MODES.map((m) => (
          <NavButton key={m.id} m={m} isActive={mode === m.id} onModeChange={onModeChange} />
        ))}
      </div>

      {/* Divider */}
      <div className="mx-3 my-1" style={{ borderTop: "1px solid var(--border)" }} />

      {/* Bottom modes */}
      <div className="flex flex-col">
        {BOTTOM_MODES.map((m) => (
          <NavButton key={m.id} m={m} isActive={mode === m.id} onModeChange={onModeChange} />
        ))}
      </div>
    </nav>
  )
}
