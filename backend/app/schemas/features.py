from pydantic import BaseModel
from .upload import Metric


class FeatureResponse(BaseModel):
    metrics: list[Metric]
