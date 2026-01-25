from fastapi import HTTPException, status
from sqlalchemy import select, Result, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from api_v1.CRM.crm_products.product_CRUD import create_product, get_product
from api_v1.CRM.crm_products.products_schemas import (
    ProductCreateSchema,
    ProductSchema,
    ProductFilterSchema,
    ProductPartialUpdateSchema,
)
from core.models.association_product_material import ProductMaterialModel
from core.models.model_products import Product


async def create_product_service(
        session: AsyncSession, new_product: ProductCreateSchema
) -> ProductSchema:
    result: Result = await session.execute(
        select(Product).where(
            Product.name == new_product.name,
            Product.size == new_product.size,
            Product.detail == new_product.detail,
            Product.description == new_product.description,
        )
    )
    product_name_check: Product | None = result.scalars().one_or_none()
    if product_name_check:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Product with this name already exists",
        )

    product: Product = await create_product(
        session=session,
        name=new_product.name,
        size=new_product.size,
        detail=new_product.detail,
        description=new_product.description,
    )

    await session.commit()
    await session.refresh(product, ["material_detail"])
    return ProductSchema.from_orm_with_materials(product)


async def get_products_service(
        session: AsyncSession, filters: ProductFilterSchema
) -> tuple[list[ProductSchema], int]:
    sort_filters = {
        "name": Product.name,
        "size": Product.size,
        "detail": Product.detail,
    }

    sort_field = sort_filters.get(filters.sort_by, Product.id)

    # 1. Сначала создаем БАЗОВЫЙ запрос с фильтрами
    base_stmt = select(Product).options(
        selectinload(Product.material_detail).selectinload(
            ProductMaterialModel.material
        ),
        selectinload(Product.price_tier),
    )

    if filters.name:
        base_stmt = base_stmt.where(Product.name == filters.name)

    if filters.search:
        base_stmt = base_stmt.where(
            or_(
                Product.name.ilike(f"%{filters.search}%"),
                Product.name.ilike(f"%{filters.search.replace('е', 'ё')}%"),
                Product.name.ilike(f"%{filters.search.replace('ё', 'е')}%"),
                Product.size.ilike(f"%{filters.search}%"),
                Product.size.ilike(f"%{filters.search.replace('е', 'ё')}%"),
                Product.size.ilike(f"%{filters.search.replace('ё', 'е')}%"),
            )
        )

    # 2. Запрос для подсчета total (только фильтры, без сортировки и пагинации)
    count_stmt = select(func.count()).select_from(base_stmt.subquery())
    total: int = await session.scalar(count_stmt)

    # 3. Основной запрос с фильтрами, сортировкой и пагинацией
    stmt = base_stmt.options(selectinload(Product.material_detail))

    # Сортировка
    if filters.sort_order == "desc":
        stmt = stmt.order_by(sort_field.desc())
    else:
        stmt = stmt.order_by(sort_field.asc())

    # Пагинация
    stmt = stmt.offset(filters.skip).limit(filters.limit)

    # Выполнение
    result = await session.execute(stmt)
    products = [
        ProductSchema.from_orm_with_materials(product)
        for product in result.scalars().all()
    ]

    return products, total


async def get_product_by_id_service(
        session: AsyncSession,
        product_id: str,
) -> ProductSchema:
    product: Product = await get_product(session=session, product_id=product_id)
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id:'{product_id}' not found",
        )

    return ProductSchema.from_orm_with_materials(product)


async def update_product_partial_service(
        session: AsyncSession,
        product_id: str,
        update_data: ProductPartialUpdateSchema,
) -> ProductSchema:
    product: Product = await get_product(session=session, product_id=product_id)

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id:'{product_id}' not found!",
        )

    to_update: dict = update_data.model_dump(exclude_unset=True)

    if not to_update:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update provided",
        )

    for key, value in to_update.items():
        setattr(product, key, value)

    await session.commit()
    await session.refresh(product)
    return ProductSchema.from_orm_with_materials(product)


async def delete_product_service(session: AsyncSession, product_id: str):
    # Если в модели есть cascade="all, delete-orphan"
    product = await session.get(
        Product,
        product_id,
        options=[
            selectinload(Product.price_tier),
            selectinload(Product.material_detail),
            selectinload(Product.product_order),
        ],  # Загружаем связанные данные
    )

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product '{product_id}' not found",
        )

    await session.delete(product)
    await session.commit()

    return {"message": f"Product '{product_id}' and all related data deleted"}
