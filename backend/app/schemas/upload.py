"""
app/schemas/upload.py — Pydantic models for the /api/upload response.

Also defines the shared Metric model reused by all other response schemas.

Models:
  Metric        — A generic label/value pair used to surface summary stats in
                  the frontend notebook cells. `value` accepts str, int, or
                  float so the same type works for counts, percentages, and
                  formatted strings alike.

  ColumnInfo    — Per-column metadata returned by the upload endpoint:
                    name    — column header
                    dtype   — pandas dtype string (e.g. "int64", "object")
                    missing — count of null values in this column

  UploadResponse — Full response body for POST /api/upload:
                    filename    — original uploaded filename
                    rows        — total row count
                    columns     — total column count
                    column_info — list of ColumnInfo for every column
                    preview     — first 5 rows as a list of dicts
                    metrics     — [Rows, Columns, Missing %] summary Metrics
"""
from pydantic import BaseModel


class Metric(BaseModel):
    label: str
    value: str | int | float


class ColumnInfo(BaseModel):
    name: str
    dtype: str
    missing: int


class UploadResponse(BaseModel):
    id: int | None = None
    filename: str
    rows: int
    columns: int
    column_info: list[ColumnInfo]
    preview: list[dict]
    metrics: list[Metric]
