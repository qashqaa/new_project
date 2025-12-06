from pydantic import EmailStr
from sqlalchemy import select, Result
from sqlalchemy.ext.asyncio import AsyncSession

from core.models import User


async def create_user(
    session: AsyncSession, username: str, email: str, password: str
) -> User:
    user: User = User(username=username, email=email)
    user.set_password(password)
    session.add(user)
    return user


async def get_by_email(session: AsyncSession, email: EmailStr) -> User | None:
    stmt = select(User).where(User.email == email)
    result: Result = await session.execute(stmt)
    user: User | None = result.scalars().one_or_none()
    return user


async def get_by_username(session: AsyncSession, username: str) -> User | None:
    stmt = select(User).where(User.username == username)
    result: Result = await session.execute(stmt)
    user: User | None = result.scalars().one_or_none()
    return user


async def get_users(session: AsyncSession) -> list[User]:
    stmt = select(User).order_by(User.id)
    result: Result = await session.execute(stmt)
    users: list[User] = list(result.scalars().all())
    return users


async def get_user(session: AsyncSession, user_id: str) -> User | None:
    stmt = select(User).where(User.id == user_id)
    result: Result = await session.execute(stmt)
    user: User | None = result.scalars().one_or_none()
    return user


async def update_user(
    session: AsyncSession, user_id: str, username: str, email: str
) -> User:
    user = await get_user(session, user_id=user_id)
    user.username = username
    user.email = email

    session.add(user)
    return user


async def update_user_partial(
    session: AsyncSession, user_id: str, **update_data
) -> User:
    user = await get_user(session, user_id=user_id)

    for field, value in update_data.items():
        if value is not None and hasattr(user, field):
            setattr(user, field, value)

    session.add(user)
    return user


async def delete_user(session: AsyncSession, user_id: str):
    user: User = await get_user(session, user_id=user_id)
    await session.delete(user)
