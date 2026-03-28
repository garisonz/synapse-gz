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
