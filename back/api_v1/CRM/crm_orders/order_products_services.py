from pydantic import NonNegativeInt
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from api_v1.utils.order_material_calculate import materials_count
from api_v1.CRM.crm_orders.order_CRUD import get_order
from api_v1.CRM.crm_orders.order_product_CRUD import (
    create_order_product,
    get_order_product,
)
from api_v1.CRM.crm_orders.orders_schemas import OrderItemCreate
from api_v1.CRM.crm_products.product_CRUD import get_product
from core.models import Order, Product, OrderProductMaterial, OrderProductModel


async def create_order_product_service(
    session: AsyncSession,
    order_id: str,
    new_order_product: OrderItemCreate,
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

    product: Product = await get_product(
        session=session, product_id=new_order_product.product_id
    )
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"product with id:{new_order_product.product_id} not found",
        )
    if any(product.id == pd.product_id for pd in order.products_detail):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"product:{product.id} already in order:{order.id}",
        )

    order_product = await create_order_product(
        session=session,
        order_id=order_id,
        product_id=new_order_product.product_id,
        quantity=new_order_product.quantity,
        product_price=product.give_product_price(new_order_product.quantity),
    )

    order_product.materials = [
        OrderProductMaterial(
            order_product_id=order_product,
            material_id=ma.material_id,
            qty_prod_in_mat=ma.quantity_in_one_mat_unit,
            actual_usage=materials_count(
                ma.quantity_in_one_mat_unit, order_product.quantity
            ),
            budged_usage=materials_count(
                ma.quantity_in_one_mat_unit, order_product.quantity
            ),
            material_price=ma.material.one_item_price,
        )
        for ma in product.material_detail
    ]
    order.total_price += order_product.product_price * order_product.quantity
    session.add(order_product)
    await session.commit()
    return {"Message": "CREATED!"}


async def order_product_count_change_service(
    session: AsyncSession,
    order_id: str,
    order_product_id: int,
    new_count: NonNegativeInt,
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

    order_product.quantity = new_count

    for elem in order_product.materials:  # type: OrderProductMaterial
        elem.actual_usage = materials_count(
            elem.qty_prod_in_mat, order_product.quantity
        )
        elem.budged_usage = materials_count(
            elem.qty_prod_in_mat, order_product.quantity
        )

    session.add(order_product)
    order.total_price += order.products_price
    await session.commit()
    return {"Message": "CHANGED!"}


async def order_product_delete_service(
    session: AsyncSession, order_id: str, order_product_id: int
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
    order.total_price -= order_product.total_price
    await session.delete(order_product)
    await session.commit()
    return {"Message": "order_product deleted!"}
