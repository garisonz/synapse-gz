from pydantic import BaseModel
from .upload import Metric


class TrainResponse(BaseModel):
    metrics: list[Metric]


class CompareResponse(BaseModel):
    metrics: list[Metric]
