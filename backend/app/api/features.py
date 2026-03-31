"""
app/api/features.py — POST /api/features route handler.

Receives a file and transformation parameters from the frontend, parses the
file into a DataFrame, then delegates to feature_engine.py to apply the
requested transformation. If a valid auth token is provided, the result is
saved to the database.

Form fields:
  file            — uploaded CSV/XLSX/XLS dataset.
  columns         — JSON-encoded list of column names to transform. Defaults to
                    all columns if the list is empty or malformed.
  method          — transformation to apply. One of:
                      onehot      — one-hot encode categorical columns
                      label       — label encode categorical columns
                      standard    — StandardScaler (zero mean, unit variance)
                      minmax      — MinMaxScaler (scale to [0, 1])
                      robust      — RobustScaler (median/IQR, outlier-resistant)
                      log         — log1p transform, adds {col}_log columns
                      sqrt        — sqrt transform, adds {col}_sqrt columns
                      polynomial  — degree-2 polynomial features via sklearn
  impute_strategy — optional missing-value strategy applied before the main
                    transform. One of: knn, mean, median, mode.

How it works:
  1. Reads and parses the uploaded file into a DataFrame via file_parser.py.
  2. JSON-decodes the columns list; defaults to all columns if empty.
  3. Calls apply_transform() from feature_engine.py and returns a
     FeatureResponse with original / generated / total column counts.
  4. If the request includes a valid bearer token, saves a FeatureRun record.
"""
import json
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import get_optional_user
from app.db.session import get_db
from app.models.history import FeatureRun
from app.models.user import User
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
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
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

    if not columns_list:
        columns_list = df.columns.tolist()

    impute = impute_strategy.strip() or None

    result = apply_transform(df, columns_list, method, impute)

    if current_user is not None:
        record = FeatureRun(
            user_id=current_user.id,
            method=method,
            columns_used=columns_list,
            impute_strategy=impute,
            metrics=[m.model_dump() for m in result.metrics],
        )
        db.add(record)
        await db.commit()

    return result
