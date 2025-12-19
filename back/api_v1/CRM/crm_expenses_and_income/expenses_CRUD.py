from datetime import date

from sqlalchemy.ext.asyncio import AsyncSession

from core.models.model_expenses import ExpenseModel


async def create_expense(
    session: AsyncSession,
    expense_type: str,
    periodicity: str,
    amount: int,
    actual_date: date = date.today(),
    description: str = None,
) -> ExpenseModel:
    new_expense = ExpenseModel(
        expense_type=expense_type,
        periodicity=periodicity,
        amount=amount,
        description=description,
        actual_date=actual_date,
    )
    session.add(new_expense)
    return new_expense


async def get_expense_by_id(
    session: AsyncSession,
    expense_id: int,
) -> ExpenseModel | None:
    expense = await session.get(ExpenseModel, expense_id)
    return expense


async def partial_update_expense(
    session: AsyncSession,
    expense: ExpenseModel,
    expense_type: str = None,
    periodicity: str = None,
    description: str = None,
    amount: int = None,
    actual_date: date = None,
) -> ExpenseModel:

    if expense_type is not None:
        expense.expense_type = expense_type

    if periodicity is not None:
        expense.periodicity = periodicity

    if description is not None:
        expense.description = description

    if amount is not None:
        expense.amount = amount

    if actual_date is not None:
        expense.actual_date = actual_date

    session.add(expense)

    return expense


async def delete_expense(session: AsyncSession, expense):
    await session.delete(expense)
    return {"message": "expense deleted!"}
