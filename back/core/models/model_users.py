from enum import Enum
import bcrypt

from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.models.base import Base

from uuid import uuid4

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from core.models.model_orders import Order
    from core.models.model_carts import Cart


class Roles(Enum):
    DEACTIVATED = "user_deleted"
    MODERATOR = "moderator"
    USER = "user"
    OWNER = "owner"
    DEVELOPER = "developer"
    DELETED = "deleted"


class User(Base):

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(primary_key=True, default=lambda: uuid4().hex)
    username: Mapped[str] = mapped_column(nullable=False, unique=True)
    email: Mapped[str] = mapped_column(nullable=False, unique=True)
    hashed_pw: Mapped[bytes] = mapped_column(nullable=False)
    role: Mapped[str] = mapped_column(nullable=False, default=Roles.USER.value)

    cart: Mapped["Cart"] = relationship(back_populates="user", uselist=False)

    orders: Mapped[list["Order"]] = relationship("Order", back_populates="user")

    def set_password(self, new_password: str):
        self.hashed_pw = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt())
        password = None

    def verify_password(self, password: str):
        return bcrypt.checkpw(password.encode("utf-8"), self.hashed_pw)

    def __str__(self):
        return f"{self.__class__.__name__}(id={self.id})"

    def __repr__(self):
        return str(self)
