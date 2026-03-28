"""
app/services/file_parser.py — Raw file bytes → pandas DataFrame conversion.

This module is the first stop for every uploaded file. All API endpoints call
parse_file() before passing the DataFrame to their respective service.

Functions:
  parse_file(file_bytes, filename) → pd.DataFrame
      Wraps the bytes in an in-memory buffer and delegates to pandas:
        .xlsx / .xls  → pd.read_excel()
        everything else → pd.read_csv()
      Raises on malformed files so the calling router can return a 422.

  get_column_info(df) → list[ColumnInfo]
      Returns one ColumnInfo object per column containing:
        name    — column header string
        dtype   — pandas dtype as a string (e.g. "int64", "object")
        missing — count of NaN/None values in that column

  get_preview(df, n=5) → list[dict]
      Returns the first n rows as a list of dicts (one dict per row), with NaN
      values replaced by empty strings so the result is JSON-serialisable.
"""
import io
import pandas as pd
from app.schemas.upload import ColumnInfo


def parse_file(file_bytes: bytes, filename: str) -> pd.DataFrame:
    buf = io.BytesIO(file_bytes)
    if filename.endswith(".xlsx") or filename.endswith(".xls"):
        return pd.read_excel(buf)
    return pd.read_csv(buf)


def get_column_info(df: pd.DataFrame) -> list[ColumnInfo]:
    return [
        ColumnInfo(
            name=col,
            dtype=str(df[col].dtype),
            missing=int(df[col].isna().sum()),
        )
        for col in df.columns
    ]


def get_preview(df: pd.DataFrame, n: int = 5) -> list[dict]:
    return df.head(n).fillna("").astype(str).to_dict(orient="records")
