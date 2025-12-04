from sqlalchemy import select, Result
from sqlalchemy.ext.asyncio import AsyncSession

from api_v1.CRM.crm_products.product_rels_schemas import ProductPriceCreateSchema
from core.models import ProductMaterialModel, ProductPriceTier


async def create_product_material(
    session: AsyncSession,
    product_id: str,
    material_id: str,
    quantity_in_one_mat_unit: int,
) -> ProductMaterialModel:
    product_material: ProductMaterialModel = ProductMaterialModel(
        product_id=product_id,
        material_id=material_id,
        quantity_in_one_mat_unit=quantity_in_one_mat_unit,
    )

    session.add(product_material)
    return product_material


async def get_products_materials(session: AsyncSession) -> list[ProductMaterialModel]:
    stmt = select(ProductMaterialModel).order_by(ProductMaterialModel.id)
    result: Result = await session.execute(stmt)
    products_materials: list[ProductMaterialModel] = list(result.scalars().all())
    return products_materials


async def get_product_material(
    session: AsyncSession, product_material_id: int
) -> ProductMaterialModel:
    stmt = select(ProductMaterialModel).where(
        ProductMaterialModel.id == product_material_id
    )
    result: Result = await session.execute(stmt)
    product_material: ProductMaterialModel = result.scalars().first()
    return product_material


async def update_product_material(
    session: AsyncSession, product_material_id: int, quantity_in_one_mat_unit: int
) -> ProductMaterialModel:
    product_material: ProductMaterialModel = await get_product_material(
        session, product_material_id=product_material_id
    )
    product_material.quantity_in_one_mat_unit = quantity_in_one_mat_unit
    session.add(product_material)
    return product_material


async def delete_product_material(session: AsyncSession, product_material_id: int):
    product_material: ProductMaterialModel = await get_product_material(
        session, product_material_id=product_material_id
    )
    await session.delete(product_material)


async def create_product_price(
    session: AsyncSession,
    product_id: str,
    start: int,
    end: int,
    price: int,
    description: str = None,
):
    product_price: ProductPriceTier = ProductPriceTier(
        product_id=product_id,
        start=start,
        end=end,
        price=price,
        description=description,
    )
    session.add(product_price)


async def update_product_price(
    session: AsyncSession,
    product_price: ProductPriceTier,
    start: int = None,
    end: int = None,
    price: int = None,
    description: str = None,
):
    if start:
        product_price.start = start

    if end:
        product_price.end = end

    if price:
        product_price.price = price

    if description:
        product_price.description = description

    session.add(product_price)
