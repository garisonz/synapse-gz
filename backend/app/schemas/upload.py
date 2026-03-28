from pydantic import BaseModel


class Metric(BaseModel):
    label: str
    value: str | int | float


class ColumnInfo(BaseModel):
    name: str
    dtype: str
    missing: int


class UploadResponse(BaseModel):
    filename: str
    rows: int
    columns: int
    column_info: list[ColumnInfo]
    preview: list[dict]
    metrics: list[Metric]
