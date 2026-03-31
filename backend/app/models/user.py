from datetime import datetime, timezone
from sqlalchemy import String, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    datasets = relationship("DatasetUpload", back_populates="user", cascade="all, delete-orphan")
    eda_results = relationship("EDAResult", back_populates="user", cascade="all, delete-orphan")
    feature_runs = relationship("FeatureRun", back_populates="user", cascade="all, delete-orphan")
    training_runs = relationship("TrainingRun", back_populates="user", cascade="all, delete-orphan")
    comparisons = relationship("ModelComparison", back_populates="user", cascade="all, delete-orphan")
