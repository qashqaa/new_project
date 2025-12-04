from fastapi import APIRouter
from fastapi import Response

from core.sqlite_db import SessionDep
from core.authx.authentification import config


from api_v1.Onboarding.Onboarding_crm.crm_onboarding_services import (
    crm_registration,
    crm_login,
)

from api_v1.CRM.crm_users.users_schemas import (
    CreateUserSchema,
    UserSchema,
    LoginSchema,
)


router = APIRouter(tags=["CRM onboarding"], prefix="/crm_onboarding")


@router.post("/registration/")
async def registration(
    session: SessionDep, create_user_schema: CreateUserSchema
) -> UserSchema:
    new_user: UserSchema = await crm_registration(session, create_user_schema)
    return new_user


@router.post("/login/")
async def login(session: SessionDep, credentials: LoginSchema, response: Response):
    token = await crm_login(session=session, credentials=credentials)
    response.set_cookie(
        key=config.JWT_ACCESS_COOKIE_NAME, value=token, httponly=True, secure=True
    )

    return {"message": True}
