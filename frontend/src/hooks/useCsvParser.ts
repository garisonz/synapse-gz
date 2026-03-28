"use client"

import { useState } from "react"

export interface UseCsvParserReturn {
  file: File | null
  parsedRows: string[][]
  columns: string[]
  handleFileChange: (file: File) => void
  handleRemove: () => void
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = []
  const lines = text.split(/\r?\n/)

  for (const line of lines) {
    if (!line.trim()) continue
    const fields: string[] = []
    let field = ""
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === "," && !inQuotes) {
        fields.push(field)
        field = ""
      } else {
        field += char
      }
    }
    fields.push(field)
    rows.push(fields)
  }

  return rows
}

export function useCsvParser(): UseCsvParserReturn {
  const [file, setFile] = useState<File | null>(null)
  const [parsedRows, setParsedRows] = useState<string[][]>([])

  const columns = parsedRows.length > 0 ? parsedRows[0] : []

  const handleFileChange = (f: File) => {
    setFile(f)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setParsedRows(parseCSV(text))
    }
    reader.readAsText(f)
  }

  const handleRemove = () => {
    setFile(null)
    setParsedRows([])
  }

  return { file, parsedRows, columns, handleFileChange, handleRemove }
}
