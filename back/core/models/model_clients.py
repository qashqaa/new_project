from uuid import uuid4
from typing import TYPE_CHECKING

from sqlalchemy.orm import mapped_column, Mapped, relationship

from core.models.base import Base

if TYPE_CHECKING:
    from core.models.model_carts import Cart


class Client(Base):
    __tablename__ = "clients"

    id: Mapped[str] = mapped_column(primary_key=True, default=lambda: uuid4().hex)
    name: Mapped[str | None]
    phone: Mapped[int | None]
    email: Mapped[str | None]
    hashed_pw: Mapped[bytes | None]

    cart: Mapped["Cart"] = relationship(back_populates="client", uselist=False)
