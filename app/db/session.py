# /app/db/session.py

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base

from app.core.config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=True)

# db session class
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=AsyncSession
)

# base class
Base = declarative_base()


async def get_db() -> AsyncSession:
    async with SessionLocal() as session:
        yield session