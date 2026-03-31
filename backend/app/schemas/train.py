"""
app/schemas/train.py — Pydantic response models for POST /api/train and
                        POST /api/compare.

Models:
  TrainResponse   — Response body for the single-model training endpoint:
                      metrics — list of Metric objects. Content varies by task:
                                  Classification: Accuracy, F1 Score, AUC
                                                  (binary only), Test samples
                                  Regression:     RMSE, R², MAE, Test samples

  CompareResponse — Response body for the multi-model comparison endpoint:
                      metrics — list of Metric objects starting with:
                                  Best Model — name of the top-scoring model
                                  Accuracy / R² — score of the best model
                                  Models — total number of models evaluated
                                followed by one Metric per model showing its
                                individual score.
"""
from pydantic import BaseModel
from .upload import Metric


class TrainResponse(BaseModel):
    metrics: list[Metric]
    confusion_matrix: list[list[int]] | None = None


class CompareResponse(BaseModel):
    metrics: list[Metric]
