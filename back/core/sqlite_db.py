from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine, AsyncSession

from fastapi import Depends

from typing import Annotated

sqlite_url = "sqlite+aiosqlite:///project_sqlite.db"

engine = create_async_engine(sqlite_url)

sqlite_session_factory = async_sessionmaker(engine, expire_on_commit=False)

async def get_session():
    async with sqlite_session_factory() as session:
        yield session


SessionDepSQLITE = Annotated[AsyncSession, Depends(get_session)]