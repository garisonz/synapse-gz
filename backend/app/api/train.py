"""
app/api/train.py — POST /api/train and POST /api/compare route handlers.

Contains two endpoints that both accept a labelled dataset and a target column,
then delegate to trainer.py for the actual ML work. If a valid auth token is
provided, results are saved to the database.

POST /api/train — single model training
  Form fields:
    file          — uploaded CSV/XLSX/XLS dataset.
    target_column — name of the column to predict (must exist in the file).
    task_type     — "classification" (default) or "regression".
    model         — model key, e.g. "random_forest", "xgboost", "svm", "knn",
                    "neural_network", "logistic_regression".
    test_split    — fraction of data held out for evaluation (0.05 – 0.50,
                    default 0.2).
  Returns TrainResponse with metrics (Accuracy/F1/AUC for classification;
  RMSE/R²/MAE for regression).

POST /api/compare — multi-model comparison
  Form fields:
    file          — uploaded CSV/XLSX/XLS dataset.
    target_column — name of the column to predict.
    task_type     — "classification" or "regression".
    models        — JSON-encoded list of model keys to compare.
    primary_metric— metric to rank models by (informational; ranking uses
                    accuracy for classification and R² for regression).
  Returns CompareResponse identifying the best model and the score for every
  model evaluated.

How it works (both endpoints):
  1. Reads and parses the uploaded file into a DataFrame via file_parser.py.
  2. Validates that target_column exists in the DataFrame.
  3. Calls train_model() or compare_models() from trainer.py and returns the
     result. Any training exception is caught and returned as a 500 error.
  4. If the request includes a valid bearer token, saves a TrainingRun or
     ModelComparison record.
"""
import json
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import get_optional_user
from app.db.session import get_db
from app.models.history import TrainingRun, ModelComparison
from app.models.user import User
from app.schemas.train import TrainResponse, CompareResponse
from app.services.file_parser import parse_file
from app.services.trainer import train_model, compare_models

router = APIRouter()


@router.post("/train", response_model=TrainResponse)
async def train(
    file: UploadFile = File(...),
    target_column: str = Form(...),
    task_type: str = Form(default="classification"),
    model: str = Form(default="random_forest"),
    test_split: float = Form(default=0.2),
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    content = await file.read()
    filename = file.filename or "upload.csv"

    try:
        df = parse_file(content, filename)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not parse file: {e}")

    if target_column not in df.columns:
        raise HTTPException(status_code=400, detail=f"Target column '{target_column}' not found")

    if not (0.05 <= test_split <= 0.5):
        raise HTTPException(status_code=400, detail="test_split must be between 0.05 and 0.5")

    try:
        result = train_model(df, target_column, task_type, model, test_split)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {e}")

    if current_user is not None:
        record = TrainingRun(
            user_id=current_user.id,
            model_name=model,
            task_type=task_type,
            target_column=target_column,
            test_split=test_split,
            metrics=[m.model_dump() for m in result.metrics],
        )
        db.add(record)
        await db.commit()

    return result


@router.post("/compare", response_model=CompareResponse)
async def compare(
    file: UploadFile = File(...),
    target_column: str = Form(...),
    task_type: str = Form(default="classification"),
    models: str = Form(default='["random_forest","logistic_regression"]'),
    primary_metric: str = Form(default="accuracy"),
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    content = await file.read()
    filename = file.filename or "upload.csv"

    try:
        df = parse_file(content, filename)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not parse file: {e}")

    if target_column not in df.columns:
        raise HTTPException(status_code=400, detail=f"Target column '{target_column}' not found")

    try:
        models_list: list[str] = json.loads(models)
    except Exception:
        models_list = ["random_forest"]

    try:
        result = compare_models(df, target_column, task_type, models_list, primary_metric)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparison failed: {e}")

    if current_user is not None:
        winner = next(
            (m.value for m in result.metrics if m.label == "Best Model"),
            models_list[0],
        )
        record = ModelComparison(
            user_id=current_user.id,
            task_type=task_type,
            target_column=target_column,
            models_used=models_list,
            winner=str(winner),
            metrics=[m.model_dump() for m in result.metrics],
        )
        db.add(record)
        await db.commit()

    return result
