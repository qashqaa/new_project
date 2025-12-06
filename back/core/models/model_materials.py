from sqlalchemy.orm import mapped_column, Mapped, relationship
from uuid import uuid4
from datetime import datetime, UTC

from core.models.base import Base

from typing import TYPE_CHECKING
import enum

if TYPE_CHECKING:
    from core.models.association_product_material import ProductMaterialModel
    from core.models.association_order_product_materials import OrderProductMaterial


class MaterialStatus(enum.IntEnum):
    ACTIVE = 1
    INACTIVE = 0


class Material(Base):
    __tablename__ = "materials"

    id: Mapped[str] = mapped_column(primary_key=True, default=lambda: uuid4().hex)
    name: Mapped[str] = mapped_column(nullable=False)
    material_type: Mapped[str]
    detail: Mapped[str | None]
    description: Mapped[str | None]

    create_at: Mapped[datetime] = mapped_column(default=datetime.now(UTC).replace(tzinfo=None))
    status: Mapped[int] = mapped_column(default=MaterialStatus.ACTIVE.value)

    pack_price: Mapped[int] = mapped_column(nullable=False)
    one_item_price: Mapped[int] = mapped_column(nullable=False)
    count_in_one_pack: Mapped[int] = mapped_column(nullable=False)
    count_left: Mapped[int] = mapped_column(nullable=False)

    # many_to_many
    products_with_material: Mapped[list["ProductMaterialModel"]] = relationship(
        back_populates="material"
    )

    orders_with_material: Mapped[list["OrderProductMaterial"]] = relationship(
        back_populates="material"
    )

    def __str__(self):
        return f"{self.__class__.__name__}(id={self.id})"

    def __repr__(self):
        return str(self)
