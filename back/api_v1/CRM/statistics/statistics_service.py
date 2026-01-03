from datetime import date

from sqlalchemy import func, select, Result
from sqlalchemy.ext.asyncio import AsyncSession

from api_v1.CRM.statistics.statistics_schemas import (
    StatisticsFilterSchema,
    StatisticsSchema,
)
from core.ResponseModel.response_model import PaginatedMonthStatistics
from core.models import Order, ExpenseModel


async def crm_get_month_statistics(
        session: AsyncSession, filters: StatisticsFilterSchema
):
    start_date = filters.date.replace(day=1)  # первый день следующего месяца
    if filters.date.month == 12:
        next_month = date(filters.date.year + 1, 1, 1)
    else:
        next_month = date(filters.date.year, filters.date.month + 1, 1)

    items = list()

    totals = {
        "total_orders_count": 0,
        "total_expenses_count": 0,
        "total_orders_amount": 0,
        "total_expenses_amount": 0,
    }

    orders_subq = (
        select(
            func.date(Order.created_date).label("date"),
            func.sum(Order.total_price).label("orders_amount"),
            func.count().label("orders_count"),
        )
        .where(Order.created_date >= start_date, Order.created_date < next_month)
        .group_by(func.date(Order.created_date))
        .subquery()
    )

    expenses_subq = (
        select(
            func.date(ExpenseModel.actual_date).label("date"),
            func.sum(ExpenseModel.amount).label("expenses_amount"),
            func.count().label("expenses_count"),
        )
        .where(
            ExpenseModel.actual_date >= start_date,
            ExpenseModel.actual_date < next_month,
        )
        .group_by(func.date(ExpenseModel.actual_date))
        .subquery()
    )

    orders_total = await session.execute(
        select(
            func.sum(orders_subq.c.orders_amount).label("amount"),
            func.sum(orders_subq.c.orders_count).label("count"),
        )
    )

    expenses_total = await session.execute(
        select(
            func.sum(expenses_subq.c.expenses_amount).label("amount"),
            func.sum(expenses_subq.c.expenses_count).label("count"),
        )
    )

    if filters.statistics_type == "all":
        stmt = (
            select(
                orders_subq.c.date,
                orders_subq.c.orders_amount,
                orders_subq.c.orders_count,
                expenses_subq.c.expenses_amount,
                expenses_subq.c.expenses_count,
            )
            .outerjoin(expenses_subq, orders_subq.c.date == expenses_subq.c.date)
            .order_by(orders_subq.c.date)
        )

        result: Result = await session.execute(stmt)
        rows = result.all()  # список Row

        items = [
            StatisticsSchema.model_validate(
                dt._mapping
            )  # _mapping превращает Row в dict
            for dt in rows
        ]

        res_order_total = orders_total.one()
        totals["total_orders_amount"] = res_order_total.amount or 0
        totals["total_orders_count"] = res_order_total.count or 0

        res_expenses_total = expenses_total.one()
        totals["total_expenses_amount"] = res_expenses_total.amount or 0
        totals["total_expenses_count"] = res_expenses_total.count or 0

    if filters.statistics_type == "orders":
        stmt = select(
            orders_subq.c.date,
            orders_subq.c.orders_amount,
            orders_subq.c.orders_count,
        ).order_by(orders_subq.c.date)

        result: Result = await session.execute(stmt)
        rows = result.all()  # список Row

        items = [
            StatisticsSchema.model_validate(
                dt._mapping
            )  # _mapping превращает Row в dict
            for dt in rows
        ]

        res_order_total = orders_total.one()
        totals["total_orders_amount"] = res_order_total.amount or 0
        totals["total_orders_count"] = res_order_total.count or 0

    if filters.statistics_type == "expenses":
        stmt = select(
            expenses_subq.c.date,
            expenses_subq.c.expenses_amount,
            expenses_subq.c.expenses_count,
        ).order_by(expenses_subq.c.date)

        result: Result = await session.execute(stmt)
        rows = result.all()  # список Row

        items = [
            StatisticsSchema.model_validate(
                dt._mapping
            )  # _mapping превращает Row в dict
            for dt in rows
        ]

        res_expenses_total = expenses_total.one()
        totals["total_expenses_amount"] = res_expenses_total.amount or 0
        totals["total_expenses_count"] = res_expenses_total.count or 0

    return PaginatedMonthStatistics(items=items, **totals)


async def crm_get_year_graph(session: AsyncSession, filters: StatisticsFilterSchema):
    totals = {
        "total_orders_count": 0,
        "total_expenses_count": 0,
        "total_orders_amount": 0,
        "total_expenses_amount": 0,
    }

    items = list()

    for month in range(1, 13):
        items.append(
            StatisticsSchema(
                date=filters.date.replace(month=month),
                orders_count=0,
                orders_amount=0,
                expenses_count=0,
                expenses_amount=0,
            )
        )
