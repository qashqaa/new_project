from typing import TYPE_CHECKING

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, UniqueConstraint

from .base import Base

if TYPE_CHECKING:
    from .model_carts import Cart


class CartProductModel(Base):
    __tablename__ = "cart_product_association"
    __table_args__ = (
        UniqueConstraint(
            "cart_id",
            "product_id",
            name="idx_unique_cart_product",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    cart_id: Mapped[str] = mapped_column(ForeignKey("carts.id"))
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"))
    quantity: Mapped[int] = mapped_column(default=1, server_default="1")
    product_price: Mapped[int] = mapped_column()

    product_in_cart: Mapped["Cart"] = relationship(back_populates="products")

    def __str__(self):
        return f"{self.__class__.__name__}(id={self.id})"

    def __repr__(self):
        return str(self)

    @property
    def total_price(self):
        return self.quantity * self.product_price

    def __eq__(self, other):
        if isinstance(other, self.__class__):
            return self.product_id
        return NotImplemented

    def __radd__(self, other):
        if isinstance(other, self.__class__):
            return other.total_price + self.total_price
        elif isinstance(other, int):
            return other + self.total_price
        return NotImplemented
