"""
app/schemas/history.py — Pydantic response models for GET /api/history/* endpoints.
"""
from datetime import datetime
from pydantic import BaseModel
from app.schemas.upload import Metric


class DatasetUploadRecord(BaseModel):
    id: int
    filename: str
    rows: int
    columns: int
    metrics: list[Metric]
    created_at: datetime

    model_config = {"from_attributes": True}


class EDAResultRecord(BaseModel):
    id: int
    dataset_id: int | None
    analyses: list[str]
    target_column: str | None
    metrics: list[Metric]
    created_at: datetime

    model_config = {"from_attributes": True}


class FeatureRunRecord(BaseModel):
    id: int
    dataset_id: int | None
    method: str
    columns_used: list[str]
    impute_strategy: str | None
    metrics: list[Metric]
    created_at: datetime

    model_config = {"from_attributes": True}


class TrainingRunRecord(BaseModel):
    id: int
    dataset_id: int | None
    model_name: str
    task_type: str
    target_column: str
    test_split: float
    metrics: list[Metric]
    created_at: datetime

    model_config = {"from_attributes": True}


class ModelComparisonRecord(BaseModel):
    id: int
    dataset_id: int | None
    task_type: str
    target_column: str
    models_used: list[str]
    winner: str
    metrics: list[Metric]
    created_at: datetime

    model_config = {"from_attributes": True}
