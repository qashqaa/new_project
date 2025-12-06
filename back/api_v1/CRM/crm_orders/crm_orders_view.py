from fastapi import APIRouter, status, Depends

from api_v1.CRM.crm_orders.crm_orders_services import (
    create_order_service,
    get_orders_service,
    get_order_by_id_service,
    products_update_service,
    order_confirm_service,
    payment_add_service,
    increase_actual_material_usage_service,
    order_ready_service,
    order_cancel_service,
    order_complete_service,
)
from api_v1.CRM.crm_orders.orders_schemas import (
    OrderCreateSchema,
    OrderFilterSchema,
    OrderSchemaWithMaterials,
    OrderItemCreate,
    OrderAppendMaterialsSchema,
)
from core import SessionDepPG
from core.ResponseModel.response_model import PaginatedResponse

router = APIRouter(prefix="/orders")


@router.post(
    "/", response_model=OrderSchemaWithMaterials, status_code=status.HTTP_201_CREATED
)
async def crm_order_create(
    session: SessionDepPG, create_data: OrderCreateSchema
) -> OrderSchemaWithMaterials:
    order: OrderSchemaWithMaterials = await create_order_service(
        session=session, new_order=create_data
    )
    return order


@router.get("/", response_model=PaginatedResponse[OrderSchemaWithMaterials])
async def crm_get_orders(
    session: SessionDepPG, filters: OrderFilterSchema = Depends()
) -> PaginatedResponse:
    orders: tuple[list[OrderSchemaWithMaterials], int] = await get_orders_service(
        session=session, filter_data=filters
    )

    return PaginatedResponse(
        items=orders[0],
        total=orders[-1],
        skip=filters.skip,
        limit=filters.limit,
        has_more=(filters.skip + filters.limit) < orders[-1],
    )


@router.get("/{order_id}", response_model=OrderSchemaWithMaterials)
async def crm_set_products(
    session: SessionDepPG,
    order_id: str,
) -> OrderSchemaWithMaterials:
    order: OrderSchemaWithMaterials = await get_order_by_id_service(
        session=session, order_id=order_id
    )
    return order


@router.patch("/{order_id}/update_products", response_model=OrderSchemaWithMaterials)
async def crm_order_products_update(
    session: SessionDepPG,
    order_id: str,
    products: list[OrderItemCreate],
) -> OrderSchemaWithMaterials:
    order: OrderSchemaWithMaterials = await products_update_service(
        session=session, order_id=order_id, products=products
    )
    return order


@router.patch("/{order_id}/confirm_order", response_model=OrderSchemaWithMaterials)
async def crm_order_confirm(
    session: SessionDepPG,
    order_id: str,
) -> OrderSchemaWithMaterials:
    order: OrderSchemaWithMaterials = await order_confirm_service(
        session=session,
        order_id=order_id,
    )
    return order


@router.patch("/{order_id}/append_payment", response_model=OrderSchemaWithMaterials)
async def crm_append_payment(
    session: SessionDepPG,
    order_id: str,
    payment: int | float,
):
    order: OrderSchemaWithMaterials = await payment_add_service(
        session=session,
        order_id=order_id,
        payment=payment,
    )
    return order


@router.patch("/{order_id}/append_materials", response_model=OrderSchemaWithMaterials)
async def crm_append_materials(
    session: SessionDepPG,
    order_id: str,
    materials: list[OrderAppendMaterialsSchema],
):
    order: OrderSchemaWithMaterials = await increase_actual_material_usage_service(
        session=session,
        order_id=order_id,
        materials=materials,
    )

    return order


@router.patch("/{order_id}/order_ready", response_model=OrderSchemaWithMaterials)
async def crm_order_ready(
    session: SessionDepPG, order_id: str
) -> OrderSchemaWithMaterials:
    order: OrderSchemaWithMaterials = await order_ready_service(
        session=session,
        order_id=order_id,
    )
    return order


@router.patch("/{order_id}/order_complete", response_model=OrderSchemaWithMaterials)
async def crm_order_complete(
    session: SessionDepPG,
    order_id: str,
):
    order: OrderSchemaWithMaterials = await order_complete_service(
        session=session,
        order_id=order_id,
    )
    return order


@router.patch(
    "/{order_id}/order_cancel",
    response_model=OrderSchemaWithMaterials,
)
async def crm_order_cancel(
    session: SessionDepPG, order_id: str
) -> OrderSchemaWithMaterials:
    order: OrderSchemaWithMaterials = await order_cancel_service(
        session=session,
        order_id=order_id,
    )
    return order
