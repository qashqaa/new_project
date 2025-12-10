from sqlalchemy import select, func, Result
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from fastapi import HTTPException, status

from api_v1.CRM.crm_orders.order_CRUD import (
    create_order,
    get_order,
)
from api_v1.CRM.crm_orders.orders_schemas import (
    OrderCreateSchema,
    OrderSchema,
    OrderFilterSchema,
)
from core.models import Order, OrderProductModel, OrderProductMaterial


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
        paid=new_order.paid,
    )
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

    if filter_data.status:
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

    if order.status in [0, 6, 5]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Can not add payment order with status:{order.status}",
        )

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"order with id:{order_id} not found",
        )

    if order.paid + payment <= order.total_price:
        print(order.paid + payment)
        print(order.total_price)
        order.paid += payment

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Wrong payment amount, recommended sum {order.remains / 100}",
        )

    await session.commit()
    await session.refresh(order)

    return OrderSchema.from_orm_with_rels(order)
