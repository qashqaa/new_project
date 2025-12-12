from fastapi import APIRouter, Depends, status

from api_v1.CRM.crm_orders.orders_schemas import (
    OrderCreateSchema,
    OrderSchema,
    OrderFilterSchema,
    OrderPartialUpdateSchema,
)
from api_v1.CRM.crm_orders.crm_orders_services import (
    create_order_service,
    get_orders_service,
    delete_order_service,
    payment_add_service,
    get_order_by_id_service,
    order_complete_service,
    partial_order_update_service,
)
from core import SessionDepPG
from core.ResponseModel.response_model import PaginatedResponse

router = APIRouter(prefix="/orders")


@router.post("/")
async def create_order_crm(
    session: SessionDepPG, new_order: OrderCreateSchema
) -> OrderSchema:
    order = await create_order_service(session=session, new_order=new_order)
    return order


@router.get("/", response_model=PaginatedResponse[OrderSchema])
async def crm_get_orders(
    session: SessionDepPG, filters: OrderFilterSchema = Depends()
) -> PaginatedResponse:
    orders: tuple[list[OrderSchema], int] = await get_orders_service(
        session=session, filter_data=filters
    )

    return PaginatedResponse(
        items=orders[0],
        total=orders[-1],
        skip=filters.skip,
        limit=filters.limit,
        has_more=(filters.skip + filters.limit) < orders[-1],
    )


@router.get("/{order_id}", response_model=OrderSchema)
async def crm_get_product(
    session: SessionDepPG,
    order_id: str,
) -> OrderSchema:
    order: OrderSchema = await get_order_by_id_service(
        session=session, order_id=order_id
    )
    return order


@router.patch("/{order_id}")
async def crm_order_update(
    session: SessionDepPG, order_id: str, update_data: OrderPartialUpdateSchema
):
    res = await partial_order_update_service(
        session=session, order_id=order_id, update_data=update_data
    )
    return res


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def crm_delete_order(session: SessionDepPG, order_id: str):
    await delete_order_service(session=session, order_id=order_id)


@router.patch("/append_payment/{order_id}", response_model=OrderSchema)
async def crm_append_payment(
    session: SessionDepPG,
    order_id: str,
    payment: int | float,
):
    order: OrderSchema = await payment_add_service(
        session=session,
        order_id=order_id,
        payment=payment,
    )
    return order


@router.patch("/order_complete/{order_id}")
async def crm_order_complete(session: SessionDepPG, order_id: str):
    res = await order_complete_service(session=session, order_id=order_id)
    return res
