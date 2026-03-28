from pydantic import BaseModel
from .upload import Metric


class EDAResponse(BaseModel):
    metrics: list[Metric]
    plots: list[str] = []
