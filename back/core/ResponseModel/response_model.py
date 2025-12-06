from pydantic import BaseModel, computed_field
from typing import Generic, TypeVar, List

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
