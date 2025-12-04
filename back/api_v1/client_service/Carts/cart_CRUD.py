from sqlalchemy import select, Result
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from core.models import Cart


async def create_cart(session: AsyncSession, user_id: str) -> Cart:
    cart: Cart = Cart(user_id=user_id)
    session.add(cart)
    return cart


async def get_carts(session: AsyncSession) -> list[Cart]:
    stmt = select(Cart).options(selectinload(Cart.products)).order_by(Cart.id)
    result: Result = await session.execute(stmt)
    carts: list[Cart] = list(result.scalars().all())
    return carts


async def get_cart(session: AsyncSession, cart_id: str) -> Cart:
    stmt = select(Cart).options(selectinload(Cart.products)).where(Cart.id == cart_id)
    result: Result = await session.execute(stmt)
    cart = result.scalars().first()
    return cart


async def update_cart():
    pass


async def delete_cart(session: AsyncSession, cart_id: str):
    cart: Cart = await get_cart(session=session, cart_id=cart_id)
    await session.delete(cart)
