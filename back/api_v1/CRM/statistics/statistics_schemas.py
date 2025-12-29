from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import date

from core.models.model_expenses import ExpenseModel
from core.models.model_orders import Order


class StatisticsExpenseSchema(BaseModel):
    id: int
    statistics_type: str
    statistics_value: int
    statistics_date: date

    @field_validator("statistics_value")
    @classmethod
    def convert_to_sum(cls, value):
        if value == 0:
            return 0
        return int(value / 100)


    @classmethod
    def from_orm(cls, expense: ExpenseModel):
        return cls(id=expense.id,
                   statistics_type="Расход",
                   statistics_value=expense.amount,
                   statistics_date=expense.actual_date)

class StatisticsIncomeSchema(BaseModel):
    id: str
    statistics_type: str
    statistics_value: int
    statistics_date: date

    @field_validator("statistics_value")
    @classmethod
    def convert_to_sum(cls, value):
        if value == 0:
            return 0
        return int(value / 100)

    @classmethod
    def from_orm(cls, order: Order):
        return cls(id=order.id,
                   statistics_type="Заказ",
                   statistics_value=order.total_price,
                   statistics_date=order.created_date.date())


class StatisticsFilterSchema(BaseModel):

    skip: Optional[int] = Field(0, ge=0, description="Пропустить записей")
    limit: Optional[int] = Field(12, ge=1, le=1000, description="Лимит на страницу")

    statistics_type: Optional[str] = Field(None)


    # Сортировка
    sort_by: Optional[str] = Field("name", description="Поле для сортировки")
    sort_order: Optional[str] = Field("asc", description="Порядок сортировки")

