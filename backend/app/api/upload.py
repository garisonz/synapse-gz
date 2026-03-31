"""
app/api/upload.py — POST /api/upload route handler.

Accepts a single file upload (CSV, XLSX, or XLS), validates it, parses it
into a DataFrame via file_parser.py, then returns metadata and a preview.
If a valid auth token is provided, the upload is recorded in the database.

How it works:
  1. Checks the file extension against ALLOWED_EXTENSIONS; rejects anything else
     with a 400 error.
  2. Reads the raw bytes and enforces the MAX_FILE_SIZE_MB limit (413 error if
     exceeded).
  3. Calls parse_file() to convert the bytes into a pandas DataFrame.
  4. Calls get_column_info() to extract per-column name, dtype, and missing count.
  5. Calls get_preview() to grab the first 5 rows as a list of dicts.
  6. Calculates overall missing-value percentage.
  7. If the request includes a valid bearer token, saves a DatasetUpload record.
  8. Returns an UploadResponse containing all of the above plus summary Metrics
     (rows, columns, missing %).
"""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import get_optional_user
from app.db.session import get_db
from app.models.history import DatasetUpload
from app.models.user import User
from app.schemas.upload import UploadResponse, Metric
from app.services.file_parser import parse_file, get_column_info, get_preview
from app.config import settings

router = APIRouter()

ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".xls"}


@router.post("/upload", response_model=UploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    filename = file.filename or ""
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    content = await file.read()
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(status_code=413, detail=f"File exceeds {settings.MAX_FILE_SIZE_MB} MB limit")

    try:
        df = parse_file(content, filename)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not parse file: {e}")

    col_info = get_column_info(df)
    preview = get_preview(df)
    missing_pct = round(df.isna().sum().sum() / df.size * 100, 1) if df.size > 0 else 0.0
    metrics = [
        Metric(label="Rows", value=len(df)),
        Metric(label="Columns", value=len(df.columns)),
        Metric(label="Missing", value=f"{missing_pct}%"),
    ]

    upload_id: int | None = None
    if current_user is not None:
        record = DatasetUpload(
            user_id=current_user.id,
            filename=filename,
            file_path=filename,
            rows=len(df),
            columns=len(df.columns),
            metrics=[m.model_dump() for m in metrics],
        )
        db.add(record)
        await db.commit()
        await db.refresh(record)
        upload_id = record.id

    return UploadResponse(
        id=upload_id,
        filename=filename,
        rows=len(df),
        columns=len(df.columns),
        column_info=col_info,
        preview=preview,
        metrics=metrics,
    )
