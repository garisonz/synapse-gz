"""create_history_tables

Revision ID: a3f2c1d4e5b6
Revises: 1a191be17169
Create Date: 2026-03-30 17:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB


revision: str = 'a3f2c1d4e5b6'
down_revision: Union[str, Sequence[str], None] = '1a191be17169'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "dataset_uploads",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("filename", sa.String(255), nullable=False),
        sa.Column("file_path", sa.String(512), nullable=False),
        sa.Column("rows", sa.Integer(), nullable=False),
        sa.Column("columns", sa.Integer(), nullable=False),
        sa.Column("metrics", JSONB(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_dataset_uploads_id", "dataset_uploads", ["id"])
    op.create_index("ix_dataset_uploads_user_id", "dataset_uploads", ["user_id"])

    op.create_table(
        "eda_results",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("dataset_id", sa.Integer(), sa.ForeignKey("dataset_uploads.id", ondelete="SET NULL"), nullable=True),
        sa.Column("analyses", JSONB(), nullable=False),
        sa.Column("target_column", sa.String(255), nullable=True),
        sa.Column("metrics", JSONB(), nullable=False),
        sa.Column("plots", JSONB(), nullable=False, server_default=sa.text("'[]'")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_eda_results_id", "eda_results", ["id"])
    op.create_index("ix_eda_results_user_id", "eda_results", ["user_id"])

    op.create_table(
        "feature_runs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("dataset_id", sa.Integer(), sa.ForeignKey("dataset_uploads.id", ondelete="SET NULL"), nullable=True),
        sa.Column("method", sa.String(50), nullable=False),
        sa.Column("columns_used", JSONB(), nullable=False),
        sa.Column("impute_strategy", sa.String(50), nullable=True),
        sa.Column("metrics", JSONB(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_feature_runs_id", "feature_runs", ["id"])
    op.create_index("ix_feature_runs_user_id", "feature_runs", ["user_id"])

    op.create_table(
        "training_runs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("dataset_id", sa.Integer(), sa.ForeignKey("dataset_uploads.id", ondelete="SET NULL"), nullable=True),
        sa.Column("model_name", sa.String(100), nullable=False),
        sa.Column("task_type", sa.String(50), nullable=False),
        sa.Column("target_column", sa.String(255), nullable=False),
        sa.Column("test_split", sa.Float(), nullable=False),
        sa.Column("metrics", JSONB(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_training_runs_id", "training_runs", ["id"])
    op.create_index("ix_training_runs_user_id", "training_runs", ["user_id"])

    op.create_table(
        "model_comparisons",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("dataset_id", sa.Integer(), sa.ForeignKey("dataset_uploads.id", ondelete="SET NULL"), nullable=True),
        sa.Column("task_type", sa.String(50), nullable=False),
        sa.Column("target_column", sa.String(255), nullable=False),
        sa.Column("models_used", JSONB(), nullable=False),
        sa.Column("winner", sa.String(100), nullable=False),
        sa.Column("metrics", JSONB(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_model_comparisons_id", "model_comparisons", ["id"])
    op.create_index("ix_model_comparisons_user_id", "model_comparisons", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_model_comparisons_user_id", table_name="model_comparisons")
    op.drop_index("ix_model_comparisons_id", table_name="model_comparisons")
    op.drop_table("model_comparisons")

    op.drop_index("ix_training_runs_user_id", table_name="training_runs")
    op.drop_index("ix_training_runs_id", table_name="training_runs")
    op.drop_table("training_runs")

    op.drop_index("ix_feature_runs_user_id", table_name="feature_runs")
    op.drop_index("ix_feature_runs_id", table_name="feature_runs")
    op.drop_table("feature_runs")

    op.drop_index("ix_eda_results_user_id", table_name="eda_results")
    op.drop_index("ix_eda_results_id", table_name="eda_results")
    op.drop_table("eda_results")

    op.drop_index("ix_dataset_uploads_user_id", table_name="dataset_uploads")
    op.drop_index("ix_dataset_uploads_id", table_name="dataset_uploads")
    op.drop_table("dataset_uploads")
