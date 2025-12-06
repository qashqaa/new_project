from functools import total_ordering
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey
from sqlalchemy.orm import mapped_column, Mapped, relationship
from core.models.base import Base

if TYPE_CHECKING:
    from core.models.model_products import Product


@total_ordering
class ProductPriceTier(Base):
    __tablename__ = "product_prices"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id", ondelete="cascade")
    )

    start: Mapped[int]
    end: Mapped[int]
    price: Mapped[int]
    description: Mapped[str | None]

    product: Mapped["Product"] = relationship(back_populates="price_tier")

    def __contains__(self, item: int) -> bool:
        return self.start <= item <= self.end

    def __eq__(self, other):
        if isinstance(other, int):
            return self.price == other
        if isinstance(other, type(self)):
            return self.price == other.price
        return NotImplemented

    def __gt__(self, other):
        if isinstance(other, int):
            return self.price > other
        if isinstance(other, type(self)):
            return self.price > other.price
        return NotImplemented
