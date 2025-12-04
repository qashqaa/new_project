from sqlalchemy import select, Result
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from core.models import Product, ProductMaterialModel


async def create_product(
    session: AsyncSession,
    name: str,
    size: str,
    description: str | None = None,
    detail: str | None = None,
) -> Product:
    product: Product = Product(
        name=name, size=size, description=description, detail=detail
    )
    product.material_detail = []
    product.price_tier = []
    session.add(product)
    return product


async def get_product(session: AsyncSession, product_id) -> Product:
    stmt = (
        select(Product)
        .options(
            selectinload(Product.material_detail).selectinload(
                ProductMaterialModel.material
            ),
            selectinload(Product.price_tier),
        )
        .where(Product.id == product_id)
    )
    result: Result = await session.execute(stmt)
    product: Product | None = result.scalars().one_or_none()

    return product
