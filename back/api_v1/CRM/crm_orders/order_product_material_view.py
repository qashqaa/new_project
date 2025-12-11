from fastapi import APIRouter
from pydantic import NonNegativeInt

from core import SessionDepPG
from api_v1.CRM.crm_orders.order_product_material_services import (
    order_product_material_actual_usage_update,
)

router = APIRouter(prefix="/{order_id}/{order_product_id}")


@router.patch("/{order_product_material_id}")
async def actual_usage_change(
    session: SessionDepPG,
    order_id: str,
    order_product_id: int,
    order_product_material_id: int,
    actual_usage: NonNegativeInt,
):

    res = await order_product_material_actual_usage_update(
        session=session,
        order_id=order_id,
        order_product_id=order_product_id,
        order_product_material_id=order_product_material_id,
        actual_usage=actual_usage,
    )

    return res
