from sqlalchemy import select, Result
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from core.models import OrderProductModel


async def create_order_product(
    session: AsyncSession,
    order_id: str,
    product_id: str,
    quantity: int,
    product_price: int,
) -> OrderProductModel:
    order_product: OrderProductModel = OrderProductModel(
        order_id=order_id,
        product_id=product_id,
        quantity=quantity,
        product_price=product_price,
    )
    session.add(order_product)
    return order_product


async def get_orders_products(session: AsyncSession) -> list[OrderProductModel]:
    stmt = (
        select(OrderProductModel)
        .options(selectinload(OrderProductModel.materials))
        .order_by(OrderProductModel.id)
    )
    result: Result = await session.execute(stmt)
    orders_products: list[OrderProductModel] = list(result.scalars().all())
    return orders_products


async def get_order_product(
    session: AsyncSession, order_product_id: int
) -> OrderProductModel:
    stmt = (
        select(OrderProductModel)
        .options(selectinload(OrderProductModel.materials))
        .where(OrderProductModel.id == order_product_id)
    )
    result: Result = await session.execute(stmt)
    order_product: OrderProductModel = result.scalars().first()
    return order_product


async def update_order_product(
    session: AsyncSession, order_product_id, quantity: int, product_price: int
) -> OrderProductModel:
    order_product: OrderProductModel = await get_order_product(
        session, order_product_id=order_product_id
    )
    order_product.product_price = product_price
    order_product.quantity = quantity
    session.add(order_product)
    return order_product


async def update_order_product_partial(
    session: AsyncSession, order_product_id: int, **update_data
) -> OrderProductModel:
    order_product = await get_order_product(session, order_product_id=order_product_id)

    for field, value in update_data.items():
        if value is not None and hasattr(order_product, field):
            setattr(order_product, field, value)

    session.add(order_product)
    return order_product


async def delete_order_product(session: AsyncSession, order_product_id: int):
    order_product: OrderProductModel = await get_order_product(
        session, order_product_id=order_product_id
    )
    await session.delete(order_product)
