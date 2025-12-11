from fastapi import APIRouter, status
from pydantic import NonNegativeInt

from api_v1.CRM.crm_orders.orders_schemas import OrderItemCreate
from api_v1.CRM.crm_orders.order_products_services import (
    create_order_product_service,
    order_product_count_change_service,
    order_product_delete_service,
)
from core import SessionDepPG

router = APIRouter(prefix="/orders/{order_id}/order_products")


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_order_product(
    session: SessionDepPG, order_id: str, new_order_product: OrderItemCreate
):
    res = await create_order_product_service(
        session=session, order_id=order_id, new_order_product=new_order_product
    )

    return res


@router.patch("/{order_product_id}")
async def change_product_qty(
    session: SessionDepPG,
    order_id: str,
    order_product_id: int,
    new_count: NonNegativeInt,
):
    res = await order_product_count_change_service(
        session=session,
        order_id=order_id,
        order_product_id=order_product_id,
        new_count=new_count,
    )

    return res


@router.delete("/{order_product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_order_product(
    session: SessionDepPG,
    order_id: str,
    order_product_id: int,
):
    res = await order_product_delete_service(
        session=session,
        order_id=order_id,
        order_product_id=order_product_id,
    )

    return res
