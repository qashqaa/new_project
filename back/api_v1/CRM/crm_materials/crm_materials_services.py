from fastapi import HTTPException, status
from sqlalchemy import select, Result, func, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from api_v1.CRM.crm_materials.material_CRUD import (
    create_material,
    get_material_by_details,
    get_material_by_id,
)
from api_v1.CRM.crm_materials.materials_schemas import (
    MaterialCreateSchema,
    MaterialSchema,
    MaterialAppendSchema,
    MaterialFilterSchema,
    MaterialPartialUpdateSchema,
)
from core.models import Material


async def create_material_service(
    session: AsyncSession, create_material_schema: MaterialCreateSchema
) -> MaterialSchema:
    mat_name = await get_material_by_details(
        session=session,
        name=create_material_schema.name,
        material_type=create_material_schema.material_type,
        detail=create_material_schema.detail,
        description=create_material_schema.description,
    )
    if mat_name:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Such material already exist",
        )

    new_material: Material = await create_material(
        session=session, **create_material_schema.model_dump()
    )
    await session.commit()
    await session.refresh(new_material)
    return MaterialSchema.model_validate(new_material)


async def get_materials_service(
    session: AsyncSession, filters: MaterialFilterSchema
) -> tuple[list[MaterialSchema], int]:

    sort_fields = {
        "name": Material.name,
        "material_type": Material.material_type,
        "count_left": Material.count_left,
        "price": Material.pack_price,
    }

    stmt = select(Material)
    if filters.material_type:
        stmt = stmt.where(Material.material_type == filters.material_type)

    if filters.search:
        stmt = stmt.where(Material.name.ilike(f"%{filters.search}%"))

    sort_field = sort_fields.get(filters.sort_by, Material.id)

    if filters.sort_order == "desc":
        stmt = stmt.order_by(sort_field.desc())
    else:
        stmt = stmt.order_by(sort_field.asc())

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total_result = await session.execute(count_stmt)
    total = total_result.scalar()

    stmt = stmt.offset(filters.skip).limit(filters.limit)

    result: Result = await session.execute(stmt)
    materials = [
        MaterialSchema.model_validate(material) for material in result.scalars().all()
    ]

    return materials, total


async def get_material_by_id_service(
    session: AsyncSession, material_id: str
) -> MaterialSchema:
    material: Material = await get_material_by_id(
        session=session, material_id=material_id
    )
    if material is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Material with id:'{material_id}' not found!",
        )
    return MaterialSchema.model_validate(material)


async def append_material_service(
    session: AsyncSession, material_id: str, update_data: MaterialAppendSchema
) -> MaterialSchema:
    material: Material = await get_material_by_id(
        session=session, material_id=material_id
    )
    if material is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Material not found!"
        )
    if material.count_left + update_data.delta < 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="cringe",
        )

    material.count_left += update_data.delta
    await session.commit()
    await session.refresh(material)
    return MaterialSchema.model_validate(material)


async def partial_update_service(
    session: AsyncSession, material_id: str, update_data: MaterialPartialUpdateSchema
) -> MaterialSchema:
    material: Material = await get_material_by_id(
        session=session, material_id=material_id
    )
    if material is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Material with id:'{material_id}' not found!",
        )

    to_update: dict = update_data.model_dump(exclude_unset=True)
    # Добавить проверку на пустое обновление
    if not to_update:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update provided",
        )

    for key, value in to_update.items():
        setattr(material, key, value)

    if material.pack_price != 0:
        material.one_item_price = round(
            material.pack_price / material.count_in_one_pack
        )

    await session.commit()
    await session.refresh(material)
    return MaterialSchema.model_validate(material)


async def delete_material_service(session: AsyncSession, material_id: str):
    stmt = (
        select(Material)
        .options(selectinload(Material.orders_with_material))
        .where(Material.id == material_id)
    )
    result: Result = await session.execute(stmt)

    material: Material | None = result.scalars().one_or_none()

    if not material:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Material '{material_id}' not found",
        )

    # Затем удаляем
    stmt = delete(Material).where(Material.id == material_id)
    await session.execute(stmt)
    await session.commit()
