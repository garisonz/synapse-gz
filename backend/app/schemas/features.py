"""
app/schemas/features.py — Pydantic response model for POST /api/features.

Models:
  FeatureResponse — Response body returned by the feature engineering endpoint:
                      metrics — list of three Metric objects:
                                  Original  — column count before transformation
                                  Generated — net new columns added (relevant
                                              for onehot, log, sqrt, polynomial)
                                  Total     — final column count after transform
"""
from pydantic import BaseModel
from .upload import Metric


class FeatureResponse(BaseModel):
    metrics: list[Metric]
