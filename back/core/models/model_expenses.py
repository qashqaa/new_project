from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, UTC, date

from core.models.base import Base


class ExpenseModel(Base):
    __tablename__ = "expenses"

    id: Mapped[int] = mapped_column(primary_key=True)
    expense_type: Mapped[str]
    description: Mapped[str | None]
    amount: Mapped[int]
    create_at: Mapped[datetime] = mapped_column(
        default=datetime.now(UTC).replace(tzinfo=None)
    )
    actual_date: Mapped[date | None]
