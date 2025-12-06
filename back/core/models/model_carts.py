from sqlalchemy import ForeignKey
from sqlalchemy.orm import mapped_column, Mapped, relationship
from uuid import uuid4

from core.models.base import Base


from typing import TYPE_CHECKING


if TYPE_CHECKING:
    from core.models.association_cart_product import CartProductModel
    from core.models.model_users import User
    from core.models.model_clients import Client


class Cart(Base):
    __tablename__ = "carts"
    id: Mapped[str] = mapped_column(primary_key=True, default=lambda: uuid4().hex)
    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"))
    client_id: Mapped[str | None] = mapped_column(ForeignKey("clients.id"))

    user: Mapped["User"] = relationship(back_populates="cart")
    client: Mapped["Client"] = relationship(back_populates="cart")

    products: Mapped[list["CartProductModel"]] = relationship(
        back_populates="product_in_cart"
    )

    def __repr__(self):
        return f"{self.__class__.__name__}({self.id})"

    @property
    def total_price(self):
        return sum(self.products)
