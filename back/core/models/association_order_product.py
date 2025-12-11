from typing import TYPE_CHECKING

from sqlalchemy import UniqueConstraint, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship


from core.models.base import Base

if TYPE_CHECKING:
    from core.models.model_products import Product
    from core.models.model_orders import Order
    from core.models.association_cart_product import CartProductModel
    from core.models.association_order_product_materials import OrderProductMaterial


class OrderProductModel(Base):
    __tablename__ = "order_product_association"
    __table_args__ = (
        UniqueConstraint(
            "order_id",
            "product_id",
            name="idx_unique_order_product",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[str] = mapped_column(ForeignKey("orders.id", ondelete="cascade"))
    product_id: Mapped[str] = mapped_column(ForeignKey("products.id"))

    product_price: Mapped[int] = mapped_column(default=0, server_default="0")
    quantity: Mapped[int] = mapped_column(default=1, server_default="1")

    # m_to_m relationships

    product: Mapped["Product"] = relationship(back_populates="product_order")
    order: Mapped["Order"] = relationship(back_populates="products_detail")
    materials: Mapped[list["OrderProductMaterial"]] = relationship(
        back_populates="order_product",
        passive_deletes="all",
    )

    @classmethod
    def from_cart_product(cls, order_id: str, cart_product: "CartProductModel"):
        return OrderProductModel(
            order_id=order_id,
            product_id=cart_product.product_id,
            product_price=cart_product.product_price,
            quantity=cart_product.quantity,
        )

    @property
    def total_price(self):
        return self.quantity * self.product_price

    def __eq__(self, other):
        if isinstance(other, self.__class__):
            return self.product_id
        if isinstance(other, str):
            return self.product_id
        return NotImplemented

    def __radd__(self, other):
        if isinstance(other, self.__class__):
            return other.total_price + self.total_price
        elif isinstance(other, int | float):
            return other + self.total_price
        return NotImplemented

    def __str__(self):
        return f"{self.__class__.__name__}(id={self.id})"

    def __repr__(self):
        return str(self)
