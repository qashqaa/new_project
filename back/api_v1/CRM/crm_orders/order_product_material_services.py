from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import NonNegativeInt

from api_v1.CRM.crm_orders.order_CRUD import get_order
from api_v1.CRM.crm_orders.order_product_CRUD import get_order_product
from api_v1.CRM.crm_orders.order_product_material_CRUD import get_order_product_material
from core.models import Order, OrderProductModel


async def order_product_material_actual_usage_update(
    session: AsyncSession,
    order_id: str,
    order_product_id: int,
    order_product_material_id: int,
    actual_usage: NonNegativeInt,
):
    order: Order = await get_order(session=session, order_id=order_id)
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"order with id:{order_id} not found",
        )

    if order.status in [6, 5]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Can not change order with status:{order.status}",
        )

    order_product: OrderProductModel = await get_order_product(
        session=session, order_product_id=order_product_id
    )

    if order_product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"order_product with id:{order_product_id} not found",
        )

    order_product_id_check = any(
        order_product_id == op.id for op in order.products_detail
    )

    if not order_product_id_check:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"in order:{order_id} not found order_product:{order_product_id}",
        )

    order_product_material = await get_order_product_material(
        session=session,
        order_product_material_id=order_product_material_id,
    )

    if order_product_material is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"order_product_material:{order_product_material_id} not found",
        )

    order_product_material_check = any(
        order_product_material_id == opm.id for opm in order_product.materials
    )

    if not order_product_material_check:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"in order_product:{order_product_id} not found"
            f" order_product_material:{order_product_material_id}",
        )

    order_product_material.actual_usage = actual_usage
    await session.commit()
    return {"Order_product_material actual usage": "CHANGED"}
