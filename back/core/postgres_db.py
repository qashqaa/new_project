from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine, AsyncSession
from fastapi import Depends
from typing import Annotated
import os

#PostgreSQL async URL
postgres_url = os.getenv("DATABASE_URL")


engine = create_async_engine(
    postgres_url,
    # echo=True,  # ← ВКЛЮЧИ ЭТО
    # pool_pre_ping=True
)


pg_session_factory = async_sessionmaker(engine, expire_on_commit=False)

async def get_session():
    async with pg_session_factory() as session:
        yield session

SessionDepPG = Annotated[AsyncSession, Depends(get_session)]