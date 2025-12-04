from sqlalchemy import select, Result
from sqlalchemy.ext.asyncio import AsyncSession

from core.models import Material


async def create_material(
    session: AsyncSession,
    name: str,
    material_type: str,
    detail: str | None,
    description: str | None,
    pack_price: int,
    count_in_one_pack: int,
    count_left: int,
) -> Material:

    one_item = 0
    if pack_price and count_in_one_pack:
        one_item = round(pack_price / count_in_one_pack)

    material: Material = Material(
        name=name,
        material_type=material_type,
        detail=detail,
        description=description,
        pack_price=pack_price,
        one_item_price=one_item,
        count_in_one_pack=count_in_one_pack,
        count_left=count_left,
    )
    session.add(material)
    return material


async def get_material_by_details(
    session: AsyncSession,
    name: str,
    material_type: str,
    detail: str,
    description: str,
):
    stmt = select(Material).where(
        Material.name == name,
        Material.material_type == material_type,
        Material.description == description,
        Material.detail == detail,
    )
    result: Result = await session.execute(stmt)
    material: Material | None = result.scalars().one_or_none()
    return material


async def get_material_by_id(session: AsyncSession, material_id) -> Material | None:
    stmt = select(Material).where(Material.id == material_id)
    result: Result = await session.execute(stmt)
    material: Material = result.scalars().one_or_none()
    return material
