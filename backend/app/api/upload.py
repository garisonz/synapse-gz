"""
app/api/upload.py — POST /api/upload route handler.

Accepts a single file upload (CSV, XLSX, or XLS), validates it, parses it
into a DataFrame via file_parser.py, then returns metadata and a preview.

How it works:
  1. Checks the file extension against ALLOWED_EXTENSIONS; rejects anything else
     with a 400 error.
  2. Reads the raw bytes and enforces the MAX_FILE_SIZE_MB limit (413 error if
     exceeded).
  3. Calls parse_file() to convert the bytes into a pandas DataFrame.
  4. Calls get_column_info() to extract per-column name, dtype, and missing count.
  5. Calls get_preview() to grab the first 5 rows as a list of dicts.
  6. Calculates overall missing-value percentage.
  7. Returns an UploadResponse containing all of the above plus summary Metrics
     (rows, columns, missing %).
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas.upload import UploadResponse, Metric
from app.services.file_parser import parse_file, get_column_info, get_preview
from app.config import settings

router = APIRouter()

ALLOWED_EXTENSIONS = {".csv", ".xlsx", ".xls"}


@router.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
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

    return UploadResponse(
        filename=filename,
        rows=len(df),
        columns=len(df.columns),
        column_info=col_info,
        preview=preview,
        metrics=[
            Metric(label="Rows", value=len(df)),
            Metric(label="Columns", value=len(df.columns)),
            Metric(label="Missing", value=f"{missing_pct}%"),
        ],
    )
