from sqlalchemy import select, Result
from sqlalchemy.ext.asyncio import AsyncSession

from core.models import CartProductModel


async def create_cart_product(
    session: AsyncSession,
    cart_id: str,
    product_id: str,
    quantity: int,
    product_price: int,
) -> CartProductModel:
    cart_product: CartProductModel = CartProductModel(
        cart_id=cart_id,
        product_id=product_id,
        quantity=quantity,
        product_price=product_price,
    )
    session.add(cart_product)
    return cart_product


async def get_carts_products(session: AsyncSession) -> list[CartProductModel]:
    stmt = select(CartProductModel).order_by(CartProductModel.id)
    result: Result = await session.execute(stmt)
    carts_products: list[CartProductModel] = list(result.scalars().all())
    return carts_products


async def get_cart_product(
    session: AsyncSession, cart_product_id: int
) -> CartProductModel:
    stmt = select(CartProductModel).where(CartProductModel.id == cart_product_id)
    result: Result = await session.execute(stmt)
    cart_product: CartProductModel = result.scalars().first()
    return cart_product


async def update_cart_product(
    session: AsyncSession, cart_product_id, quantity: int, product_price: int
) -> CartProductModel:
    cart_product: CartProductModel = await get_cart_product(
        session, cart_product_id=cart_product_id
    )
    cart_product.product_price = product_price
    cart_product.quantity = quantity
    session.add(cart_product)
    return cart_product


async def update_cart_product_partial(
    session: AsyncSession, cart_product_id: int, **update_data
) -> CartProductModel:
    cart_product = await get_cart_product(session, cart_product_id=cart_product_id)

    for field, value in update_data.items():
        if value is not None and hasattr(cart_product, field):
            setattr(cart_product, field, value)

    session.add(cart_product)
    return cart_product


async def delete_cart_product(session: AsyncSession, cart_product_id: int):
    cart_product: CartProductModel = await get_cart_product(
        session, cart_product_id=cart_product_id
    )
    await session.delete(cart_product)
