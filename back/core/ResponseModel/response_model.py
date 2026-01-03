from typing import Generic, TypeVar, List

from pydantic import BaseModel, computed_field, Field, field_validator

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    skip: int
    limit: int
    has_more: bool

    @computed_field
    @property
    def total_pages(self) -> int:
        return (self.total + self.limit - 1) // self.limit

    @computed_field
    @property
    def current_page(self) -> int:
        return (self.skip // self.limit) + 1


class PaginatedMonthStatistics(BaseModel, Generic[T]):
    items: List[T]

    total_orders_count: int = Field(0)
    total_expenses_count: int = Field(0)
    total_orders_amount: int = Field(0)
    total_expenses_amount: int = Field(0)

    @field_validator("total_orders_amount")
    @classmethod
    def convert_to_sum_orders(cls, v):
        if v == 0:
            return 0
        return int(v / 100)

    @field_validator("total_expenses_amount")
    @classmethod
    def convert_to_sum_expenses(cls, v):
        if v == 0:
            return 0
        return int(v / 100)
