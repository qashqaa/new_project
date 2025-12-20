from typing import Optional
from datetime import date, datetime

from pydantic import BaseModel, Field, NonNegativeFloat, field_validator, NonNegativeInt


class NewExpenseSchema(BaseModel):
    expense_type: str
    periodicity: str
    description: Optional[str] = Field(None)
    amount: NonNegativeFloat | NonNegativeInt
    actual_date: Optional[date] = Field(None)

    @field_validator("amount")
    @classmethod
    def convert_to_uzs_tiyin(cls, amount):
        if amount == 0:
            return 0
        return int(amount * 100)


class ExpenseSchema(BaseModel):
    id: int
    expense_type: str
    periodicity: str
    description: Optional[str] = Field(None)
    amount: int
    actual_date: date
    create_at: datetime

    @field_validator("amount")
    @classmethod
    def convert_to_uzs_sum(cls, amount):
        if amount == 0:
            return 0
        return int(amount / 100)

    model_config = {"from_attributes": True}


class ExpensesFilterSchema(BaseModel):
    skip: Optional[int] = Field(0, ge=0, description="Пропустить записей")
    limit: Optional[int] = Field(12, ge=1, le=1000, description="Лимит на страницу")

    actual_date_from: Optional[date] = Field(None, description="Дата создания от")
    actual_date_to: Optional[date] = Field(None, description="Дата создания до")

    expense_type: Optional[str] = Field(None, description="Фильтр по типу расхода")
    periodicity: Optional[str] = Field(
        None, description="Фильтр по периодичности расхода"
    )

    sort_order: Optional[str] = Field("asc", description="Порядок сортировки")


class ExpenseUpdateSchema(BaseModel):
    expense_type: Optional[str] = Field(None)
    periodicity: Optional[str] = Field(None)
    description: Optional[str] = Field(None)
    amount: Optional[int] = Field(None)
    actual_date: Optional[date] = Field(None)

    @field_validator("amount")
    @classmethod
    def convert_to_uzs_tiyin(cls, amount):
        if amount == 0:
            return 0
        return int(amount * 100)
