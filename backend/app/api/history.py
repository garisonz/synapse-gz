"""
app/api/history.py — GET /api/history/* route handlers.

Returns the authenticated user's past runs for each pipeline stage.
All endpoints require a valid bearer token.

GET /api/history/uploads     — list of past dataset uploads
GET /api/history/eda         — list of past EDA results
GET /api/history/features    — list of past feature engineering runs
GET /api/history/training    — list of past training runs
GET /api/history/comparisons — list of past model comparisons

All lists are sorted newest-first and capped at `limit` items (default 50).
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth import get_current_user
from app.db.session import get_db
from app.models.history import (
    DatasetUpload,
    EDAResult,
    FeatureRun,
    ModelComparison,
    TrainingRun,
)
from app.models.user import User
from app.schemas.history import (
    DatasetUploadRecord,
    EDAResultRecord,
    FeatureRunRecord,
    ModelComparisonRecord,
    TrainingRunRecord,
)

router = APIRouter(prefix="/history", tags=["history"])


@router.get("/uploads", response_model=list[DatasetUploadRecord])
async def list_uploads(
    limit: int = Query(default=50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(DatasetUpload)
        .where(DatasetUpload.user_id == current_user.id)
        .order_by(desc(DatasetUpload.created_at))
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/eda", response_model=list[EDAResultRecord])
async def list_eda(
    limit: int = Query(default=50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(EDAResult)
        .where(EDAResult.user_id == current_user.id)
        .order_by(desc(EDAResult.created_at))
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/features", response_model=list[FeatureRunRecord])
async def list_features(
    limit: int = Query(default=50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(FeatureRun)
        .where(FeatureRun.user_id == current_user.id)
        .order_by(desc(FeatureRun.created_at))
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/training", response_model=list[TrainingRunRecord])
async def list_training(
    limit: int = Query(default=50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(TrainingRun)
        .where(TrainingRun.user_id == current_user.id)
        .order_by(desc(TrainingRun.created_at))
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/comparisons", response_model=list[ModelComparisonRecord])
async def list_comparisons(
    limit: int = Query(default=50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ModelComparison)
        .where(ModelComparison.user_id == current_user.id)
        .order_by(desc(ModelComparison.created_at))
        .limit(limit)
    )
    return result.scalars().all()
