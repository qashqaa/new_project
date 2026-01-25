from typing import Annotated

from fastapi import APIRouter, status, Depends
from pydantic import Field

from api_v1.CRM.crm_expenses_and_income.expenses_schemas import (
    NewExpenseSchema,
    ExpenseSchema,
    ExpensesFilterSchema,
    ExpenseUpdateSchema,
)
from api_v1.CRM.crm_expenses_and_income.expenses_service import (
    create_expense_service,
    get_all_expenses_service,
    get_expense_by_id_service,
    update_expense_service,
    delete_expense_service,
)
from core.ResponseModel.response_model import PaginatedResponse
from core.postgres_db import SessionDepPG

router = APIRouter(prefix="/expenses")

ExpenseID = Annotated[int, Field(gt=0, le=1000000)]


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_expense_crm(
        session: SessionDepPG,
        new_expense: NewExpenseSchema,
) -> ExpenseSchema:
    expense = await create_expense_service(session=session, new_expense=new_expense)
    return expense


@router.get("/", response_model=PaginatedResponse[ExpenseSchema])
async def get_all_expenses_crm(
        session: SessionDepPG,
        expense_filters: ExpensesFilterSchema = Depends(),
):
    expenses: tuple[list[ExpenseSchema], int, int] = await get_all_expenses_service(
        session=session,
        expense_filter=expense_filters,
    )

    return PaginatedResponse(
        items=expenses[0],
        total_summary=expenses[-2],
        total=expenses[-1],
        skip=expense_filters.skip,
        limit=expense_filters.limit,
        has_more=(expense_filters.skip + expense_filters.limit) < expenses[-1],
    )


@router.get("/{expense_id}", response_model=ExpenseSchema)
async def get_by_id_expense_crm(session: SessionDepPG, expense_id: ExpenseID):
    expense: ExpenseSchema = await get_expense_by_id_service(
        session=session, expense_id=expense_id
    )
    return expense


@router.patch("/{expense_id}", response_model=ExpenseSchema)
async def update_by_id_expense_crm(
        session: SessionDepPG, expense_id: ExpenseID, update_data: ExpenseUpdateSchema
):
    updated = await update_expense_service(
        session=session, expense_id=expense_id, update_data=update_data
    )
    await session.commit()
    return updated


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_by_id_expense_crm(session: SessionDepPG, expense_id: ExpenseID):
    result = await delete_expense_service(session=session, expense_id=expense_id)
    return result
