import asyncio

from sqlalchemy import select, Result
from core.models.model_materials import Material
from core.sqlite_db import session_factory
from api_v1.CRM.crm_products.products_schemas import MaterialItem


async def main():
    async with session_factory() as session:
        materials = [
            MaterialItem(material_id="3c9e87bd2d704b04b8793cbb71bf5b14", quantity=5),
            MaterialItem(material_id="886d44ef0dfe4063adb8ba83b0103f09", quantity=5),
            MaterialItem(material_id="886d44ef", quantity=5),
        ]

        material_ids = [m.material_id for m in materials]
        stmt = select(Material.id).where(Material.id.in_(material_ids))
        result: Result = await session.execute(stmt)
        existing_ids = {mid for mid in result.scalars().all()}
        print(type(existing_ids))
        print(set(material_ids) - existing_ids)


if __name__ == "__main__":
    asyncio.run(main())
