"""
app/api/eda.py — POST /api/eda route handler.

Receives a file and an analysis configuration from the frontend, parses the
file into a DataFrame, then delegates to eda_engine.py to perform the
requested analyses. If a valid auth token is provided, the result is saved
to the database.

Form fields:
  file          — uploaded CSV/XLSX/XLS dataset.
  analyses      — JSON-encoded list of analysis types to run. Defaults to all
                  five: ["summary", "missing", "distribution", "correlation",
                  "outliers"].
  target_column — optional column name to use for class-level stats (e.g.
                  class counts). Silently ignored if the column doesn't exist.

How it works:
  1. Reads and parses the uploaded file into a DataFrame via file_parser.py.
  2. JSON-decodes the analyses string; falls back to ["summary", "missing"] if
     the value is malformed.
  3. Validates target_column against the DataFrame's columns; sets it to None
     if not found.
  4. Calls run_eda() from eda_engine.py and returns the EDAResponse (metrics
     list + base64-encoded plot images).
  5. If the request includes a valid bearer token, saves an EDAResult record.
"""
import json
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import get_optional_user
from app.db.session import get_db
from app.models.history import EDAResult
from app.models.user import User
from app.schemas.eda import EDAResponse
from app.services.file_parser import parse_file
from app.services.eda_engine import run_eda

router = APIRouter()


@router.post("/eda", response_model=EDAResponse)
async def eda(
    file: UploadFile = File(...),
    analyses: str = Form(default='["summary","missing","distribution","correlation","outliers"]'),
    target_column: str = Form(default=""),
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
        analyses_list: list[str] = json.loads(analyses)
    except Exception:
        analyses_list = ["summary", "missing"]

    target = target_column.strip() or None
    if target and target not in df.columns:
        target = None

    result = run_eda(df, analyses_list, target)

    if current_user is not None:
        record = EDAResult(
            user_id=current_user.id,
            analyses=analyses_list,
            target_column=target,
            metrics=[m.model_dump() for m in result.metrics],
            plots=result.plots,
        )
        db.add(record)
        await db.commit()

    return result
