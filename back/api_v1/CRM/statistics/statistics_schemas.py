from datetime import date
from typing import Literal

from pydantic import BaseModel, Field, field_validator, computed_field


class StatisticsSchema(BaseModel):
    date: date
    expenses_count: int = Field(0)
    orders_count: int = Field(0)
    expenses_amount: int = Field(0)
    orders_amount: int = Field(0)

    model_config = {"from_attributes": True}

    @field_validator("expenses_amount")
    @classmethod
    def convert_to_sum_expenses(cls, v):
        if v == 0:
            return 0
        return int(v / 100)

    @field_validator("orders_amount")
    @classmethod
    def convert_to_sum_order(cls, v):
        if v == 0:
            return 0
        return int(v / 100)

    @computed_field()
    def difference(self) -> int:
        return self.orders_amount - self.expenses_amount


class StatisticsFilterSchema(BaseModel):
    date: date
    statistics_type: Literal["orders", "expenses", "all"]
