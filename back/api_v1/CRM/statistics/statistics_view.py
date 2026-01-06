from fastapi import APIRouter, Depends

from api_v1.CRM.statistics.statistics_schemas import (
    StatisticsFilterSchema,
    StatisticsSchema,
)
from api_v1.CRM.statistics.statistics_service import (
    crm_get_month_statistics,
    crm_get_year_graph,
)
from core.ResponseModel.response_model import PaginatedMonthStatistics
from core.postgres_db import SessionDepPG

router = APIRouter(prefix="/statistics")


@router.get("/month", response_model=PaginatedMonthStatistics[StatisticsSchema])
async def get_month_statistics(
        session: SessionDepPG, filters_data: StatisticsFilterSchema = Depends()
):
    result: PaginatedMonthStatistics = await crm_get_month_statistics(
        session=session, filters=filters_data
    )

    return result


@router.get("/graphs", response_model=PaginatedMonthStatistics[StatisticsSchema])
async def get_statistics_graphs(session: SessionDepPG):
    result: PaginatedMonthStatistics = await crm_get_year_graph(session=session)
    return result
