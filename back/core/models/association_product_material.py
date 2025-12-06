from typing import TYPE_CHECKING

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, UniqueConstraint

from .base import Base

if TYPE_CHECKING:
    from .model_products import Product
    from .model_materials import Material


class ProductMaterialModel(Base):
    __tablename__ = "product_material_association"
    __table_args__ = (
        UniqueConstraint(
            "product_id",
            "material_id",
            name="idx_unique_product_material",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[str] = mapped_column(
        ForeignKey("products.id", ondelete="cascade")
    )
    material_id: Mapped[str] = mapped_column(
        ForeignKey("materials.id", ondelete="cascade")
    )
    quantity_in_one_mat_unit: Mapped[int] = mapped_column(default=1, server_default="1")

    product: Mapped["Product"] = relationship(back_populates="material_detail")
    material: Mapped["Material"] = relationship(back_populates="products_with_material")

    def __str__(self):
        return f"{self.__class__.__name__}(id={self.id})"

    def __repr__(self):
        return str(self)
