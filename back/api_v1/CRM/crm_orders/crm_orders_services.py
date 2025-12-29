from sqlalchemy import select, func, Result
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status
from datetime import datetime, UTC

from api_v1.CRM.crm_orders.order_CRUD import (
    create_order,
    get_order,
)
from api_v1.CRM.crm_orders.orders_schemas import (
    OrderCreateSchema,
    OrderSchema,
    OrderFilterSchema,
    OrderPartialUpdateSchema,
)
from core.models import Order, OrderProductModel, OrderProductMaterial, OrderStatus


async def create_order_service(
    session: AsyncSession,
    new_order: OrderCreateSchema,
) -> OrderSchema:
    order = await create_order(
        session=session,
        user_id=new_order.user_id,
        client_id=new_order.client_id,
        customer=new_order.customer,
        descriptions=new_order.descriptions,
    )
    session.add(order)
    await session.commit()
    order = await get_order(session=session, order_id=order.id)
    return OrderSchema.from_orm_with_rels(order)


async def get_orders_service(
    session: AsyncSession, filter_data: OrderFilterSchema
) -> tuple[list[OrderSchema], int]:
    sort_filters = {
        "created_date": Order.created_date,
        "customer": Order.customer,
        "status": Order.status,
    }

    sort_field = sort_filters.get(filter_data.sort_by, Order.created_date)
    stmt = select(Order).options(
        selectinload(Order.products_detail).options(
            selectinload(OrderProductModel.product),
            selectinload(OrderProductModel.materials).selectinload(
                OrderProductMaterial.material
            ),
        ),
        selectinload(Order.costs),
    )

    if filter_data.created_date_from:
        stmt = stmt.where(Order.created_date >= filter_data.created_date_from)

    if filter_data.created_date_to:
        stmt = stmt.where(Order.created_date <= filter_data.created_date_to)

    if filter_data.customer:
        stmt = stmt.where(Order.customer == filter_data.customer)

    if filter_data.status is not None:
        stmt = stmt.where(Order.status == filter_data.status)

    if filter_data.used_id:
        stmt = stmt.where(Order.user_id == filter_data.used_id)

    if filter_data.client_id:
        stmt = stmt.where(Order.client_id == filter_data.client_id)

    if filter_data.search:
        stmt = stmt.where(Order.id == filter_data.search)

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total: int = await session.scalar(count_stmt)

    if filter_data.sort_order == "desc":
        stmt = stmt.order_by(sort_field.desc())
    else:
        stmt = stmt.order_by(sort_field.asc())

    result: Result = await session.execute(stmt)
    orders: list[Order] = list(result.scalars().all())

    return [OrderSchema.from_orm_with_rels(order) for order in orders], total


async def get_order_by_id_service(session: AsyncSession, order_id: str) -> OrderSchema:
    order: Order = await get_order(session=session, order_id=order_id)
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"order with id:{order_id} not found",
        )

    return OrderSchema.from_orm_with_rels(order)


async def delete_order_service(session: AsyncSession, order_id: str) -> bool:
    order = await session.get(Order, order_id)
    if not order:
        return False

    # if order.status == 5:
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail=f"Can not add payment order with status:{order.status}",
    #     )

    await session.delete(order)
    await session.commit()
    return True


async def payment_add_service(
    session: AsyncSession, order_id: str, payment: int | float
) -> OrderSchema:
    if payment <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"payment is 0 or lower",
        )
    else:
        payment = payment * 100

    order: Order | None = await get_order(session=session, order_id=order_id)

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"order with id:{order_id} not found",
        )

    if order.status in [6, 5]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Can not add payment order with status:{order.status}",
        )

    if order.paid + payment <= order.total_price:
        order.paid += payment

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Wrong payment amount, recommended sum {order.remains / 100}",
        )

    await session.commit()
    await session.refresh(order)

    return OrderSchema.from_orm_with_rels(order)


async def order_complete_service(session: AsyncSession, order_id: str):
    order: Order = await get_order(session=session, order_id=order_id)

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"order with id:{order_id} not found",
        )

    if order.status > 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Can not complete order with status:{Order.status}",
        )

    if order.remains != 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"The order could not be completed, it was not paid {order.remains / 100}",
        )

    total_material_price = sum(
        sum(opm.total_price_actual for opm in op.materials)
        for op in order.products_detail
    )

    order.materials_price = total_material_price
    order.completed_date = datetime.now(UTC).replace(tzinfo=None)
    order.status = OrderStatus.COMPLETED.value
    await session.commit()
    return {"Message": f"Order status changed:{order.status}"}


async def partial_order_update_service(
    session: AsyncSession,
    order_id: str,
    update_data: OrderPartialUpdateSchema,
):
    order: Order = await get_order(session=session, order_id=order_id)

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"order with id:{order_id} not found",
        )

    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=f"no data for update"
        )

    if update_data.customer is not None:
        order.customer = update_data.customer

    if update_data.description is not None:
        order.descriptions = update_data.description

    await session.commit()
    return {"Message": f"order:{order_id} updated!"}


async def order_revert_to_created_status_service(session: AsyncSession, order_id: str):
    order: Order = await get_order(session=session, order_id=order_id)

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"order with id:{order_id} not found",
        )

    if order.status != 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    order.status = OrderStatus.CREATED.value
    order.paid = 0
    order.materials_price = 0

    await session.commit()
    return {"Message": f"Order status changed:{order.status}"}