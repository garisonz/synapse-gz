"use client"

import React from "react"

interface Mode {
  id: string
  label: string
  icon: React.ReactNode
}

const MODES: Mode[] = [
  {
    id: "eda",
    label: "Auto EDA",
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
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
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
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
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="1,13 5,9 9,11 13,5" />
        <circle cx="13" cy="5" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: "comparison",
    label: "Comparison",
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="3" width="5" height="10" rx="0.5" />
        <rect x="10" y="3" width="5" height="10" rx="0.5" />
        <polyline points="7,8 9,6 9,10" />
      </svg>
    ),
  },
]

interface ModeSelectorProps {
  mode: string
  onModeChange: (mode: string) => void
}

export function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <div className="flex flex-col gap-0.5 p-2">
      {MODES.map((m) => {
        const isActive = mode === m.id
        return (
          <button
            key={m.id}
            onClick={() => onModeChange(m.id)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-left transition-colors w-full"
            style={{
              background: isActive ? "var(--surface-active)" : "transparent",
              color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
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
                e.currentTarget.style.color = "var(--text-secondary)"
              }
            }}
          >
            <span className="shrink-0">{m.icon}</span>
            <span>{m.label}</span>
          </button>
        )
      })}
    </div>
  )
}
