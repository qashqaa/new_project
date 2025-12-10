import enum
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey
from sqlalchemy.orm import mapped_column, Mapped, relationship
from uuid import uuid4
from datetime import datetime, UTC

from core.models.base import Base


if TYPE_CHECKING:
    from core.models.model_users import User
    from core.models.association_order_product import OrderProductModel
    from core.models.association_order_add_costs import OrderAddCostsModel


class OrderStatus(enum.IntEnum):
    CREATED = 0
    IN_PROGRESS = 2
    READY = 3
    SHIPPED = 4
    COMPLETED = 5
    CANCELED = 6


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[str] = mapped_column(primary_key=True, default=lambda: uuid4().hex)
    status: Mapped[int] = mapped_column(
        nullable=False, default=OrderStatus.CREATED.value
    )
    total_price: Mapped[int] = mapped_column(default=0, server_default="0")
    materials_price: Mapped[int] = mapped_column(default=0, server_default="0")
    customer: Mapped[str | None] = mapped_column(nullable=True)
    descriptions: Mapped[str | None] = mapped_column(nullable=True)
    created_date: Mapped[datetime] = mapped_column(
        nullable=False, default=lambda: datetime.now(UTC).replace(tzinfo=None)
    )
    hiring_date: Mapped[datetime | None] = mapped_column(nullable=True)
    ready_date: Mapped[datetime | None] = mapped_column(nullable=True)
    completed_date: Mapped[datetime | None] = mapped_column(nullable=True)
    canceled_date: Mapped[datetime | None] = mapped_column(nullable=True)
    paid: Mapped[int] = mapped_column(default=0, server_default="0")

    ## relationships one_to_one
    client_id: Mapped[str | None] = mapped_column(ForeignKey("clients.id"))
    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"))
    user: Mapped["User"] = relationship("User", back_populates="orders")

    ## relationships one_to_many
    costs: Mapped[list["OrderAddCostsModel"]] = relationship(back_populates="order")

    ## relationships many_to_many

    products_detail: Mapped[list["OrderProductModel"]] = relationship(
        back_populates="order", passive_deletes=True
    )

    def __str__(self):
        return f"{self.__class__.__name__}({self.id})"

    def __repr__(self):
        return str(self)

    @property
    def products_price(self):
        return sum(self.products_detail)

    @property
    def remains(self):
        return self.total_price - self.paid

    @property
    def prepay_sum(self):
        paid = (self.total_price // 2) - self.paid
        if paid > 0:
            return paid
        else:
            return 0
