from fastapi import APIRouter, status

from api_v1.CRM.crm_orders.order_cost_service import (
    create_order_cost_service,
    delete_order_cost_service,
)
from api_v1.CRM.crm_orders.orders_schemas import CreateOrderAdditionalCoastSchema
from core import SessionDepPG

router = APIRouter(prefix="/{order_id}/costs")


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_order_cost(
    session: SessionDepPG,
    order_id: str,
    new_cost: CreateOrderAdditionalCoastSchema,
):
    res = await create_order_cost_service(
        session=session, order_id=order_id, new_cost=new_cost
    )
    return res


@router.delete("/{order_cost_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_order_cost(
    session: SessionDepPG,
    order_id: str,
    order_cost_id: int,
):
    res = await delete_order_cost_service(
        session=session,
        order_id=order_id,
        order_cost_id=order_cost_id,
    )

    return res
