from datetime import date, datetime

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

        orders_total = await session.execute(
            select(
                func.sum(orders_subq.c.orders_amount).label("amount"),
                func.sum(orders_subq.c.orders_count).label("count"),
            )
        )

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

        expenses_total = await session.execute(
            select(
                func.sum(expenses_subq.c.expenses_amount).label("amount"),
                func.sum(expenses_subq.c.expenses_count).label("count"),
            )
        )

        res_expenses_total = expenses_total.one()
        totals["total_expenses_amount"] = res_expenses_total.amount or 0
        totals["total_expenses_count"] = res_expenses_total.count or 0

    return PaginatedMonthStatistics(
        items=items,
        total_orders_count=totals["total_orders_count"],
        total_orders_amount=int(totals["total_orders_amount"] / 100),
        total_expenses_count=totals["total_expenses_count"],
        total_expenses_amount=int(totals["total_expenses_amount"] / 100),
    )


async def crm_get_year_graph(session: AsyncSession):
    totals = {
        "total_orders_count": 0,
        "total_expenses_count": 0,
        "total_orders_amount": 0,
        "total_expenses_amount": 0,
    }

    start = datetime.now()
    start = start.date().replace(month=start.month + 1)

    items = list()

    for j in range(12):

        if start.month == 1:
            start = start.replace(year=start.year - 1, month=12, day=1)
        else:
            start = start.replace(month=start.month - 1, day=1)

        if start.month == 12:
            next_month = date(start.year + 1, 1, 1)
        else:
            next_month = date(start.year, start.month + 1, 1)

        orders_subq = (
            select(
                func.date(Order.created_date).label("date"),
                func.sum(Order.total_price).label("orders_amount"),
                func.count().label("orders_count"),
            )
            .where(Order.created_date >= start, Order.created_date < next_month)
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
                ExpenseModel.actual_date >= start,
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

        res_order_total = orders_total.one()
        res_expenses_total = expenses_total.one()

        totals["total_orders_count"] += res_order_total.count or 0
        totals["total_expenses_count"] += res_expenses_total.count or 0
        totals["total_orders_amount"] += res_order_total.amount or 0
        totals["total_expenses_amount"] += res_expenses_total.amount or 0

        items.append(
            StatisticsSchema(
                date=start,
                orders_count=res_order_total.count or 0,
                orders_amount=res_order_total.amount or 0,
                expenses_count=res_expenses_total.count or 0,
                expenses_amount=res_expenses_total.amount or 0,
            )
        )

    return PaginatedMonthStatistics(
        items=items,
        total_orders_count=totals["total_orders_count"],
        total_orders_amount=int(totals["total_orders_amount"] / 100),
        total_expenses_count=totals["total_expenses_count"],
        total_expenses_amount=int(totals["total_expenses_amount"] / 100),
    )
