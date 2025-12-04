from sqlalchemy import select, Result
from sqlalchemy.ext.asyncio import AsyncSession

from core.models import OrderProductMaterial


async def create_order_product_materials(
    session: AsyncSession,
    order_product_id: int,
    material_id: str,
    qty_prod_in_mat: int,
    budged_usage: int,
    actual_usage: int,
    material_price: int,
) -> OrderProductMaterial:
    order_product_material: OrderProductMaterial = OrderProductMaterial(
        order_product_id=order_product_id,
        material_id=material_id,
        qty_prod_in_mat=qty_prod_in_mat,
        budged_usage=budged_usage,
        actual_usage=actual_usage,
        material_price=material_price,
    )
    session.add(order_product_material)
    return order_product_material


async def get_order_products_materials(
    session: AsyncSession,
) -> list[OrderProductMaterial]:
    stmt = select(OrderProductMaterial).order_by(OrderProductMaterial.id)
    result: Result = await session.execute(stmt)
    order_products_materials: list[OrderProductMaterial] = list(result.scalars().all())
    return order_products_materials


async def get_order_product_material(
    session: AsyncSession,
    order_product_material_id: int,
) -> OrderProductMaterial:
    stmt = select(OrderProductMaterial).where(
        OrderProductMaterial.id == order_product_material_id
    )
    result: Result = await session.execute(stmt)
    order_product_material: OrderProductMaterial = result.scalars().first()
    return order_product_material


async def update_order_product_material(
    session: AsyncSession,
    order_product_material_id,
    qty_prod_in_mat: int,
    budged_usage: int,
    actual_usage: int,
    material_price: int,
) -> OrderProductMaterial:
    order_product_material: OrderProductMaterial = await get_order_product_material(
        session, order_product_material_id=order_product_material_id
    )
    order_product_material.qty_prod_in_mat = qty_prod_in_mat
    order_product_material.material_price = material_price
    order_product_material.actual_usage = actual_usage
    order_product_material.budged_usage = budged_usage

    session.add(order_product_material)
    return order_product_material


async def update_order_product_material_partial(
    session: AsyncSession, order_product_material_id: int, **update_data
) -> OrderProductMaterial:
    order_product_material = await get_order_product_material(
        session, order_product_material_id=order_product_material_id
    )

    for field, value in update_data.items():
        if value is not None and hasattr(order_product_material, field):
            setattr(order_product_material, field, value)

    session.add(order_product_material)
    return order_product_material


async def delete_order_product_material(
    session: AsyncSession, order_product_material_id: int
):
    order_product_material: OrderProductMaterial = await get_order_product_material(
        session, order_product_material_id=order_product_material_id
    )
    await session.delete(order_product_material)
