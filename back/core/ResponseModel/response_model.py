from typing import Generic, TypeVar, List, Optional

from pydantic import BaseModel, computed_field, Field

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total_summary: Optional[int] = Field(None)
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
