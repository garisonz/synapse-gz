from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
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

app.include_router(upload_router, prefix="/api")
app.include_router(eda_router, prefix="/api")
app.include_router(features_router, prefix="/api")
app.include_router(train_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "Synapse API", "docs": "/docs"}
