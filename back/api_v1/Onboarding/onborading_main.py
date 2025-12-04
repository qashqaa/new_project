from fastapi import APIRouter
from api_v1.Onboarding.Onboarding_crm.crm_onboarding_view import (
    router as crm_onboarding_router,
)

router = APIRouter(tags=["Onboarding"], prefix="/onboarding")

router.include_router(crm_onboarding_router)
