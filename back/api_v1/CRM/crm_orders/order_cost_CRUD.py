from sqlalchemy.ext.asyncio import AsyncSession
from core.models import OrderAddCostsModel


async def create_order_cost(
    session: AsyncSession,
    order_id: str,
    cost: int,
    description: str,
) -> OrderAddCostsModel:
    order_cost = OrderAddCostsModel(
        order_id=order_id,
        cost=cost,
        description=description,
    )

    session.add(order_cost)
    return order_cost


async def delete_order_cost(session: AsyncSession, order_cost_id: int) -> bool:

    order_cost = await session.get(OrderAddCostsModel, order_cost_id)

    if not order_cost:
        return False

    await session.delete(order_cost)
    return True
