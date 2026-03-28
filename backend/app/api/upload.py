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
