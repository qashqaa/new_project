from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from api_v1.CRM.crm_orders.order_CRUD import get_order
from api_v1.CRM.crm_orders.orders_schemas import CreateOrderAdditionalCoastSchema
from core.models import OrderAddCostsModel, Order


async def create_order_cost_service(
    session: AsyncSession,
    order_id: str,
    new_cost: CreateOrderAdditionalCoastSchema,
):
    order: Order | None = await get_order(session=session, order_id=order_id)

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"order with id:{order_id} not found",
        )
    order_cost = OrderAddCostsModel(
        order_id=order_id,
        cost=new_cost.cost,
        description=new_cost.description,
    )

    order.total_price -= order_cost.cost
    session.add(order_cost)
    await session.commit()
    return {"Message": "CREATED"}


async def delete_order_cost_service(
    session: AsyncSession,
    order_id: str,
    order_cost_id: int,
):
    order: Order | None = await get_order(session=session, order_id=order_id)

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"order with id:{order_id} not found",
        )
    order_cost: OrderAddCostsModel | None = await session.get(
        OrderAddCostsModel, order_cost_id
    )

    if order_cost is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"order_cost:{order_cost_id} in order:{order_id} not found",
        )

    await session.delete(order_cost)
    order.total_price += order_cost.cost
    await session.commit()
    return {"Message": "DELETED"}
