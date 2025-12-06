from sqlalchemy import select, Result
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload

from core.models import (
    Order,
    OrderProductModel,
    OrderStatus,
    OrderProductMaterial,
)


async def create_order(
    session: AsyncSession,
    user_id: str | None,
    customer: str | None = None,
    descriptions: str | None = None,
    client_id: str | None = None,
    paid: int = 0,
) -> Order:
    order = Order(
        user_id=user_id,
        customer=customer,
        descriptions=descriptions,
        client_id=client_id,
        paid=paid,
    )
    session.add(order)
    return order


async def get_orders(session: AsyncSession) -> list[Order]:
    stmt = (
        select(Order)
        .options(selectinload(Order.products_detail), joinedload(Order.user))
        .order_by(Order.created_date)
    )

    result: Result = await session.execute(stmt)

    orders: list[Order] = list(result.scalars().all())
    return orders


async def get_order(session: AsyncSession, order_id: str) -> Order | None:
    stmt = (
        select(Order)
        .options(
            selectinload(Order.products_detail).options(
                selectinload(OrderProductModel.product),
                selectinload(OrderProductModel.materials).selectinload(
                    OrderProductMaterial.material
                ),
            )
        )
        .order_by(Order.created_date)
        .where(Order.id == order_id)
    )
    result: Result = await session.execute(stmt)
    order: Order | None = result.scalars().one_or_none()
    return order


async def update_order(
    session: AsyncSession,
    order_id,
    customer: str,
    status: OrderStatus,
    total_price: int,
    paid: int,
) -> Order:
    order: Order = await get_order(session=session, order_id=order_id)
    order.customer = customer
    order.status = status
    order.total_price = total_price
    order.paid = paid
    session.add(order)
    return order


async def update_order_partial(
    session: AsyncSession, order_id: str, **update_data
) -> Order:
    order = await get_order(session, order_id=order_id)

    for field, value in update_data.items():
        if value is not None and hasattr(order, field):
            setattr(order, field, value)

    session.add(order)
    return order


async def delete_order(session: AsyncSession, order_id: str):
    order: Order = await get_order(session=session, order_id=order_id)
    await session.delete(order)
