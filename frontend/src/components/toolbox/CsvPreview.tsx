"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface CsvPreviewProps {
  rows: string[][]
}

export function CsvPreview({ rows }: CsvPreviewProps) {
  if (rows.length === 0) return null

  const headers = rows[0]
  const dataRows = rows.slice(1)
  const displayRows = dataRows.slice(0, 5)
  const totalRows = dataRows.length

  return (
    <div className="flex flex-col gap-1">
      <div
        className="overflow-x-auto rounded-md border"
        style={{ borderColor: "var(--border)" }}
      >
        <Table className="font-mono text-[12px] w-max min-w-full">
          <TableHeader>
            <TableRow
              style={{
                borderColor: "var(--border)",
                background: "var(--surface-active)",
              }}
            >
              {headers.map((header, i) => (
                <TableHead
                  key={i}
                  className="py-1.5 px-3 h-auto whitespace-nowrap"
                  style={{
                    color: "var(--text-secondary)",
                    background: "var(--surface-active)",
                    minWidth: "100px",
                    maxWidth: "200px",
                  }}
                >
                  <span
                    className="block truncate"
                    title={header}
                  >
                    {header}
                  </span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayRows.map((row, ri) => (
              <TableRow
                key={ri}
                style={{
                  borderColor: "var(--border)",
                  background:
                    ri % 2 === 0 ? "var(--bg-primary)" : "var(--bg-secondary)",
                }}
              >
                {row.map((cell, ci) => (
                  <TableCell
                    key={ci}
                    className="py-1 px-3 whitespace-nowrap"
                    style={{
                      color: "var(--text-primary)",
                      minWidth: "100px",
                      maxWidth: "200px",
                    }}
                  >
                    <span
                      className="block truncate"
                      title={cell}
                    >
                      {cell}
                    </span>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {totalRows > 5 && (
        <p
          className="text-[11px] font-mono text-right"
          style={{ color: "var(--text-muted)" }}
        >
          Showing 5 of {totalRows} rows
        </p>
      )}
    </div>
  )
}
