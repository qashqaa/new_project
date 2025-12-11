import enum
from datetime import datetime, UTC
from typing import TYPE_CHECKING
from uuid import uuid4

from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.models.base import Base

if TYPE_CHECKING:
    from core.models.association_product_material import ProductMaterialModel
    from core.models.association_order_product import OrderProductModel
    from core.models import ProductPriceTier


class ProductStatus(enum.IntEnum):
    ACTIVE = 1
    INACTIVE = 0


class Product(Base):
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(primary_key=True, default=lambda: uuid4().hex)
    name: Mapped[str]
    size: Mapped[str]
    detail: Mapped[str | None]
    description: Mapped[str | None]

    create_at: Mapped[datetime] = mapped_column(
        default=lambda: datetime.now(UTC).replace(tzinfo=None)
    )
    status: Mapped[int] = mapped_column(default=ProductStatus.ACTIVE.value)

    # many_to_many

    material_detail: Mapped[list["ProductMaterialModel"]] = relationship(
        back_populates="product",
    )

    product_order: Mapped[list["OrderProductModel"]] = relationship(
        back_populates="product",
    )

    price_tier: Mapped[list["ProductPriceTier"]] = relationship(
        back_populates="product",
    )

    def __str__(self):
        return f"{self.__class__.__name__}(id={self.id})"

    def __repr__(self):
        return str(self)

    def give_product_price(self, quantity: int) -> int:
        """Возвращает цену (число) для указанного количества."""
        if not self.price_tier:
            return 0

        # Ищем подходящий price_tier
        for price_tier in self.price_tier:
            if quantity in price_tier:  # использует contains
                return price_tier.price  # ← возвращаем число!

        # Если не нашли подходящий диапазон, берем минимальную цену
        if self.price_tier:
            return min(self.price_tier).price  # ← .price!

        return 0
