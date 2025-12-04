from fastapi import APIRouter, status, Depends


from api_v1.CRM.crm_products.products_schemas import (
    ProductCreateSchema,
    ProductSchema,
    ProductFilterSchema,
    ProductPartialUpdateSchema,
)
from core.ResponseModel.response_model import PaginatedResponse
from core.postgres_db import SessionDepPG

from api_v1.CRM.crm_products.products_services import (
    create_product_service,
    get_products_service,
    get_product_by_id_service,
    update_product_partial_service,
    delete_product_service,
)

router = APIRouter(prefix="/products")


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=ProductSchema)
async def crm_create_product(
    session: SessionDepPG, new_product: ProductCreateSchema
) -> ProductSchema:
    product: ProductSchema = await create_product_service(
        session=session, new_product=new_product
    )
    return product


@router.get("/", response_model=PaginatedResponse[ProductSchema])
async def crm_get_products(
    session: SessionDepPG, filters: ProductFilterSchema = Depends()
) -> PaginatedResponse:
    products: tuple[list[ProductSchema], int] = await get_products_service(
        session=session, filters=filters
    )

    return PaginatedResponse(
        items=products[0],
        total=products[-1],
        skip=filters.skip,
        limit=filters.limit,
        has_more=(filters.skip + filters.limit) < products[-1],
    )


@router.get("/{product_id}", response_model=ProductSchema)
async def crm_get_product_by_id(session: SessionDepPG, product_id: str) -> ProductSchema:
    product: ProductSchema = await get_product_by_id_service(
        session=session, product_id=product_id
    )
    return product


@router.patch("/{product_id}")
async def crm_partial_update(
    session: SessionDepPG,
    product_id: str,
    update_data: ProductPartialUpdateSchema,
) -> ProductSchema:
    product: ProductSchema = await update_product_partial_service(
        session=session, product_id=product_id, update_data=update_data
    )
    return product


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def crm_product_delete(session: SessionDepPG, product_id: str):
    await delete_product_service(session=session, product_id=product_id)
