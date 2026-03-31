import asyncio
import os
import sys
from logging.config import fileConfig

from sqlalchemy.ext.asyncio import create_async_engine

from alembic import context

# Make app/ importable when running alembic from the backend/ directory
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.db.base import Base  # noqa: E402
from app.models import user, history  # noqa: F401, E402 — import all models so Base.metadata is populated

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

# Prefer DATABASE_URL env var (set by Docker Compose) over alembic.ini value
_url = os.environ.get("DATABASE_URL") or config.get_main_option("sqlalchemy.url")


def run_migrations_offline() -> None:
    context.configure(
        url=_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    connectable = create_async_engine(_url)
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    asyncio.run(run_migrations_online())
