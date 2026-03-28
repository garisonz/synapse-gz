import json
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.schemas.eda import EDAResponse
from app.services.file_parser import parse_file
from app.services.eda_engine import run_eda

router = APIRouter()


@router.post("/eda", response_model=EDAResponse)
async def eda(
    file: UploadFile = File(...),
    analyses: str = Form(default='["summary","missing","distribution","correlation","outliers"]'),
    target_column: str = Form(default=""),
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

    return run_eda(df, analyses_list, target)
