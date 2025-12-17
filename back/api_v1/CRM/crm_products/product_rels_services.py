from fastapi import HTTPException, status
from pydantic.v1 import PositiveInt
from sqlalchemy import Result, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.sql.functions import session_user
from pydantic import Field

from api_v1.CRM.crm_materials.material_CRUD import get_material_by_id
from api_v1.CRM.crm_products.product_CRUD import get_product
from api_v1.CRM.crm_products.product_rels_CRUD import (
    create_product_material,
    get_product_material,
    create_product_price,
    update_product_price,
)
from api_v1.CRM.crm_products.product_rels_schemas import (
    ProductMaterialCreateSchema,
    ProductPriceCreateSchema,
    ProductPriceUpdateSchema,
)
from core.models import ProductMaterialModel, Material, Product, ProductPriceTier


async def create_product_material_service(
    session: AsyncSession, product_id: str, new_prod_mat: ProductMaterialCreateSchema
):
    product: Product | None = await get_product(session=session, product_id=product_id)

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id:'{product_id}' not found!",
        )

    result: Result = await session.execute(
        select(ProductMaterialModel).where(
            ProductMaterialModel.product_id == product_id,
            ProductMaterialModel.material_id == new_prod_mat.material_id,
        )
    )
    product_material_check: ProductMaterialModel | None = result.scalars().one_or_none()

    if product_material_check:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Material:{new_prod_mat.material_id} already exists in product",
        )

    material: Material | None = await get_material_by_id(
        session=session, material_id=new_prod_mat.material_id
    )
    if material is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Material with id:{new_prod_mat.material_id} not found!",
        )

    product_material = await create_product_material(
        session=session, product_id=product_id, **new_prod_mat.model_dump()
    )

    await session.commit()


async def update_product_material_service(
    session: AsyncSession,
    product_material_id: int,
    quantity_in_one_mat_unit: PositiveInt,
):
    product_material: ProductMaterialModel | None = await get_product_material(
        session=session, product_material_id=product_material_id
    )

    if product_material is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product material with id:{product_material_id} not found",
        )

    product_material.quantity_in_one_mat_unit = quantity_in_one_mat_unit
    await session.commit()


async def delete_product_material_service(
    session: AsyncSession,
    product_material_id: int,
):
    # Если в модели есть cascade="all, delete-orphan"
    product_material = await session.get(ProductMaterialModel, product_material_id)

    if not product_material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product '{product_material_id}' not found",
        )

    await session.delete(product_material)
    await session.commit()


async def create_product_price_service(
    session: AsyncSession, product_id: str, price_data: ProductPriceCreateSchema
):

    product: Product | None = await get_product(session=session, product_id=product_id)

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id:'{product_id}' not found!",
        )

    await create_product_price(
        session=session, product_id=product_id, **price_data.model_dump()
    )
    await session.commit()


async def update_product_price_service(
    session: AsyncSession, price_id: int, update_data: ProductPriceUpdateSchema
):
    product_price: ProductPriceTier | None = await session.get(
        ProductPriceTier, price_id
    )

    if not product_price:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product '{price_id}' not found",
        )

    await update_product_price(
        session=session, product_price=product_price, **update_data.model_dump()
    )
    await session.commit()


async def delete_product_price_service(session: AsyncSession, price_id: int):
    product_price: ProductPriceTier | None = await session.get(
        ProductPriceTier, price_id
    )

    if not product_price:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product '{price_id}' not found",
        )

    await session.delete(product_price)
    await session.commit()
