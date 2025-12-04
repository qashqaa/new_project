from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from api_v1.CRM.crm_users.users_schemas import (
    CreateUserSchema,
    UserSchema,
    LoginSchema,
)
from api_v1.CRM.crm_users.user_CRUD import (
    create_user,
    get_by_email,
    get_by_username,
)
from core.authx import security
from core.models import User


async def crm_registration(
    session: AsyncSession, create_user_schema: CreateUserSchema
) -> UserSchema:
    email_user: User | None = await get_by_email(
        session=session, email=create_user_schema.email
    )
    if email_user:
        raise HTTPException(status_code=400, detail="Email is already taken!")

    username_user: User | None = await get_by_username(
        session=session, username=create_user_schema.username
    )

    if username_user:
        raise HTTPException(status_code=400, detail="Username is already taken!")

    new_user = await create_user(session=session, **create_user_schema.model_dump())
    await session.commit()
    await session.refresh(new_user)

    return UserSchema.model_validate(new_user)


async def crm_login(session: AsyncSession, credentials: LoginSchema) -> str:
    user: User = await get_by_email(session, credentials.email)
    if not user or not user.verify_password(credentials.password):
        raise HTTPException(status_code=401, detail="Incorrect login or password")
    token = security.create_access_token(
        uid=user.id, role=user.role, data={"role": user.role}
    )

    return token
