"""
app/main.py — FastAPI application entry point.

This is the top-level file that boots the entire backend. It:
  1. Creates the FastAPI app instance with metadata (title, version).
  2. Attaches CORS middleware using origins from config.py, so the Next.js
     frontend (default: http://localhost:3000) is allowed to make cross-origin
     requests.
  3. Registers the four API routers, each mounted under the /api prefix:
       POST /api/upload   → upload.py  (file validation + metadata)
       POST /api/eda      → eda.py     (exploratory data analysis)
       POST /api/features → features.py (feature engineering)
       POST /api/train    → train.py   (single model training)
       POST /api/compare  → train.py   (multi-model comparison)
  4. Exposes a root GET / health-check endpoint.

Request flow through the backend:
    HTTP Request
        → CORSMiddleware           (validates origin header)
        → app/api/*.py             (router: reads form fields, validates input)
        → app/services/file_parser (converts uploaded bytes → pandas DataFrame)
        → app/services/*.py        (business logic: analysis, transforms, training)
        → app/schemas/*.py         (Pydantic model serialises result → JSON response)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.auth import router as auth_router
from app.api.upload import router as upload_router
from app.api.eda import router as eda_router
from app.api.features import router as features_router
from app.api.train import router as train_router

app = FastAPI(title="Synapse API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api")
app.include_router(upload_router, prefix="/api")
app.include_router(eda_router, prefix="/api")
app.include_router(features_router, prefix="/api")
app.include_router(train_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "Synapse API", "docs": "/docs"}
