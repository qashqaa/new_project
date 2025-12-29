from fastapi import APIRouter

from api_v1.CRM.statistics.statistics_schemas import StatisticsFilterSchema
from core.postgres_db import SessionDepPG

router = APIRouter(prefix="/statistics")

@router.get("/")
async def get_statistics(session: SessionDepPG, filters: StatisticsFilterSchema):
    pass