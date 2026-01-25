from fastapi import HTTPException, status
from sqlalchemy import select, func, Result
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased

from api_v1.CRM.crm_expenses_and_income.expenses_CRUD import (
    create_expense,
    get_expense_by_id,
    partial_update_expense,
    delete_expense,
)
from api_v1.CRM.crm_expenses_and_income.expenses_schemas import (
    NewExpenseSchema,
    ExpenseSchema,
    ExpensesFilterSchema,
    ExpenseUpdateSchema,
)
from core.models import ExpenseModel


async def create_expense_service(
        session: AsyncSession,
        new_expense: NewExpenseSchema,
) -> ExpenseSchema:
    new_expense = await create_expense(
        session=session,
        expense_type=new_expense.expense_type,
        periodicity=new_expense.periodicity,
        description=new_expense.description,
        amount=new_expense.amount,
        actual_date=new_expense.actual_date,
    )
    await session.commit()
    return ExpenseSchema.model_validate(new_expense)


async def get_all_expenses_service(
        session: AsyncSession, expense_filter: ExpensesFilterSchema
) -> tuple[list[ExpenseSchema], int, int]:
    stmt = select(ExpenseModel)

    if expense_filter.actual_date_from:
        stmt = stmt.where(ExpenseModel.actual_date >= expense_filter.actual_date_from)

    if expense_filter.actual_date_to:
        stmt = stmt.where(ExpenseModel.actual_date <= expense_filter.actual_date_to)

    if expense_filter.expense_type is not None and expense_filter.expense_type:
        stmt = stmt.where(ExpenseModel.expense_type == expense_filter.expense_type)

    if expense_filter.periodicity is not None and expense_filter.periodicity:
        stmt = stmt.where(ExpenseModel.periodicity == expense_filter.periodicity)

    if expense_filter.sort_order == "desc":
        stmt = stmt.order_by(ExpenseModel.actual_date.desc())
    else:
        stmt = stmt.order_by(ExpenseModel.actual_date.asc())

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total_result = await session.execute(count_stmt)
    total: int = total_result.scalar()

    # Создаем подзапрос
    subq = stmt.subquery()

    # Создаем алиас для модели в подзапросе
    expenseAlias = aliased(ExpenseModel, subq)

    # Суммируем amount из подзапроса
    query_summary = select(func.sum(expenseAlias.amount)).select_from(subq)

    summary_result = await session.execute(query_summary)
    total_summary_raw = summary_result.scalar() or 0
    total_summary: int = int(total_summary_raw / 100)

    stmt = stmt.offset(expense_filter.skip).limit(expense_filter.limit)

    result: Result = await session.execute(stmt)
    expenses = [
        ExpenseSchema.model_validate(expense) for expense in result.scalars().all()
    ]

    return expenses, total_summary, total


async def get_expense_by_id_service(
        session: AsyncSession, expense_id: int
) -> ExpenseSchema:
    expense = await get_expense_by_id(session=session, expense_id=expense_id)
    return ExpenseSchema.model_validate(expense)


async def update_expense_service(
        session: AsyncSession,
        expense_id: int,
        update_data: ExpenseUpdateSchema,
) -> ExpenseSchema:
    expense: ExpenseModel | None = await get_expense_by_id(
        session=session, expense_id=expense_id
    )

    if expense is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"expense with id:{expense_id} not found",
        )

    updated_expense = await partial_update_expense(
        session=session,
        expense=expense,
        expense_type=update_data.expense_type,
        periodicity=update_data.periodicity,
        description=update_data.description,
        amount=update_data.amount,
        actual_date=update_data.actual_date,
    )

    await session.commit()
    return ExpenseSchema.model_validate(updated_expense)


async def delete_expense_service(session: AsyncSession, expense_id: int):
    expense: ExpenseModel | None = await get_expense_by_id(
        session=session, expense_id=expense_id
    )

    if expense is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"expense with id:{expense_id} not found",
        )

    await delete_expense(session=session, expense=expense)
    await session.commit()
    return {"Message": f"expense {expense_id} deleted!"}
