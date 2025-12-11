from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.models.base import Base

if TYPE_CHECKING:
    from core.models.association_order_product import OrderProductModel
    from core.models.model_materials import Material


class OrderProductMaterial(Base):
    __tablename__ = "order_product_materials"
    __table_args__ = (
        UniqueConstraint(
            "order_product_id",
            "material_id",
            name="idx_unique_order_product_material",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    order_product_id: Mapped[int] = mapped_column(
        ForeignKey("order_product_association.id", ondelete="cascade")
    )
    material_id: Mapped[str] = mapped_column(ForeignKey("materials.id"))

    qty_prod_in_mat: Mapped[int] = mapped_column(default=0, server_default="0")
    budged_usage: Mapped[int] = mapped_column(default=0, server_default="0")
    actual_usage: Mapped[int] = mapped_column(default=0, server_default="0")
    material_price: Mapped[int] = mapped_column(default=0, server_default="0")

    order_product: Mapped["OrderProductModel"] = relationship(
        back_populates="materials",
    )
    material: Mapped["Material"] = relationship(back_populates="orders_with_material")

    @property
    def total_price_actual(self):
        return self.actual_usage * self.material_price

    @property
    def total_price_budged(self):
        return self.budged_usage * self.material_price

    def __eq__(self, other):
        if isinstance(other, self.__class__):
            return (
                other.material_id == self.material_id
                and other.order_product_id == self.order_product_id
            )
        if isinstance(other, tuple):
            return other[0] == self.material_id and other[1] == self.order_product_id
        return NotImplemented

    def __radd__(self, other):
        if isinstance(other, self.__class__):
            return other.total_price_actual + self.total_price_actual
        elif isinstance(other, int | float):
            return other + self.total_price_actual
        return NotImplemented

    def __str__(self):
        return f"{self.__class__.__name__}(id={self.id})"

    def __repr__(self):
        return str(self)
