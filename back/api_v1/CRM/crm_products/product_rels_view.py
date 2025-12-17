from typing import Annotated

from fastapi import APIRouter, status, Depends
from pydantic import PositiveInt, Field

from api_v1.CRM.crm_products.product_rels_schemas import (
    ProductMaterialCreateSchema,
    ProductPriceCreateSchema,
    ProductPriceUpdateSchema,
)
from core.postgres_db import SessionDepPG

from api_v1.CRM.crm_products.product_rels_services import (
    create_product_material_service,
    update_product_material_service,
    delete_product_material_service,
    create_product_price_service,
    update_product_price_service,
    delete_product_price_service,
)

router = APIRouter(prefix="/product_rels")


@router.post("/material/{product_id}", status_code=status.HTTP_201_CREATED)
async def crm_product_material_create(
    session: SessionDepPG, product_id: str, new_prod_mat: ProductMaterialCreateSchema
):
    await create_product_material_service(
        session=session, product_id=product_id, new_prod_mat=new_prod_mat
    )
    return {"True": "product_material created!"}


@router.patch("/material/{product_material_id}")
async def crm_product_material_update(
    session: SessionDepPG,
    product_material_id: int,
    quantity_in_one_mat_unit: PositiveInt,
):
    await update_product_material_service(
        session=session,
        product_material_id=product_material_id,
        quantity_in_one_mat_unit=quantity_in_one_mat_unit,
    )
    return {"True": "product_material updated!"}


@router.delete(
    "/material/{product_material_id}", status_code=status.HTTP_204_NO_CONTENT
)
async def crm_product_material_delete(
    session: SessionDepPG, product_material_id: Annotated[int, Field(gt=0, le=1000000)]
):
    await delete_product_material_service(
        session=session, product_material_id=product_material_id
    )


@router.post("/price/{product_id}", status_code=status.HTTP_201_CREATED)
async def crm_product_price_create(
    session: SessionDepPG, product_id: str, new_price: ProductPriceCreateSchema
):
    await create_product_price_service(
        session=session, product_id=product_id, price_data=new_price
    )

    return {"True": "product_price created!"}


@router.patch("/price/{price_id}")
async def crm_product_price_update(
    session: SessionDepPG,
    price_id: int,
    update_data: ProductPriceUpdateSchema,
):
    await update_product_price_service(
        session=session, price_id=price_id, update_data=update_data
    )


@router.delete("/price/{price_id}", status_code=status.HTTP_204_NO_CONTENT)
async def crm_product_material_delete(
    session: SessionDepPG,
    price_id: int,
):
    await delete_product_price_service(session=session, price_id=price_id)
