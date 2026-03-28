import json
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
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
        return train_model(df, target_column, task_type, model, test_split)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {e}")


@router.post("/compare", response_model=CompareResponse)
async def compare(
    file: UploadFile = File(...),
    target_column: str = Form(...),
    task_type: str = Form(default="classification"),
    models: str = Form(default='["random_forest","logistic_regression"]'),
    primary_metric: str = Form(default="accuracy"),
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
        return compare_models(df, target_column, task_type, models_list, primary_metric)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparison failed: {e}")
