from sqlalchemy import ForeignKey
from sqlalchemy.orm import mapped_column, Mapped, relationship
from core.models.base import Base
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from core.models.model_orders import Order


class OrderAddCostsModel(Base):
    __tablename__ = "order_add_cost_association"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[str] = mapped_column(
        ForeignKey("orders.id", ondelete="cascade"),
    )
    cost: Mapped[int]
    description: Mapped[str]

    order: Mapped["Order"] = relationship(back_populates="costs")
