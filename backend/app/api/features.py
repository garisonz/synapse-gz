import json
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.schemas.features import FeatureResponse
from app.services.file_parser import parse_file
from app.services.feature_engine import apply_transform

router = APIRouter()


@router.post("/features", response_model=FeatureResponse)
async def features(
    file: UploadFile = File(...),
    columns: str = Form(default="[]"),
    method: str = Form(default="standard"),
    impute_strategy: str = Form(default=""),
):
    content = await file.read()
    filename = file.filename or "upload.csv"

    try:
        df = parse_file(content, filename)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not parse file: {e}")

    try:
        columns_list: list[str] = json.loads(columns)
    except Exception:
        columns_list = df.columns.tolist()

    # Default to all columns if none selected
    if not columns_list:
        columns_list = df.columns.tolist()

    impute = impute_strategy.strip() or None

    return apply_transform(df, columns_list, method, impute)
