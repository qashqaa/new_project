from datetime import datetime, UTC

from fastapi import HTTPException, status
from sqlalchemy import select, func, Result, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from api_v1.CRM.crm_materials.material_CRUD import get_material_by_id
from api_v1.CRM.crm_orders.order_CRUD import create_order, get_order
from api_v1.CRM.crm_orders.orders_schemas import (
    OrderCreateSchema,
    OrderItemCreate,
    OrderFilterSchema,
    OrderSchemaWithMaterials,
    OrderAppendMaterialsSchema,
)
from api_v1.CRM.crm_products.product_CRUD import get_product
from api_v1.utils.order_material_calculate import materials_count
from core.models import (
    Order,
    OrderProductModel,
    OrderProductMaterial,
    Product,
    ProductMaterialModel,
    OrderStatus,
    Material,
)


async def create_order_service(
    session: AsyncSession, new_order: OrderCreateSchema
) -> OrderSchemaWithMaterials:
    order: Order = await create_order(
        session=session,
        customer=new_order.customer,
        descriptions=new_order.descriptions,
        user_id=new_order.user_id,
    )
    await set_order_products(
        session=session, order=order, products=new_order.products_detail
    )

    await session.commit()
    await get_order(session=session, order_id=order.id)
    return OrderSchemaWithMaterials.from_orm_with_rels(order)


async def set_order_products(
    session: AsyncSession,
    order: Order,
    products: list[OrderItemCreate],
):
    rels = []

    if order.products_detail:
        stmt = delete(OrderProductModel).where(OrderProductModel.order_id == order.id)
        await session.execute(stmt)
        order.products_detail.clear()

    for prod in products:
        db_product: Product = await get_product(
            session=session, product_id=prod.product_id
        )
        if db_product is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with id:'{prod.product_id}' not found",
            )
        rels.append(
            OrderProductModel(
                order=order,
                product_id=prod.product_id,
                product_price=db_product.give_product_price(quantity=prod.quantity),
                quantity=prod.quantity,
            )
        )

        order.total_price = sum(rels)
        session.add(order)
        session.add_all(rels)

    return rels


async def get_orders_service(
    session: AsyncSession, filter_data: OrderFilterSchema
) -> tuple[list[OrderSchemaWithMaterials], int]:
    sort_filters = {
        "created_date": Order.created_date,
        "customer": Order.customer,
        "status": Order.status,
    }

    sort_field = sort_filters.get(filter_data.sort_by, Order.created_date)
    stmt = select(Order).options(
        selectinload(Order.products_detail).options(
            selectinload(OrderProductModel.product),
            selectinload(OrderProductModel.materials).selectinload(
                OrderProductMaterial.material
            ),
        )
    )

    if filter_data.created_date_from:
        stmt = stmt.where(Order.created_date >= filter_data.created_date_from)

    if filter_data.created_date_to:
        stmt = stmt.where(Order.created_date <= filter_data.created_date_to)

    if filter_data.customer:
        stmt = stmt.where(Order.customer == filter_data.customer)

    if filter_data.status:
        stmt = stmt.where(Order.status == filter_data.status)

    if filter_data.used_id:
        stmt = stmt.where(Order.user_id == filter_data.used_id)

    if filter_data.client_id:
        stmt = stmt.where(Order.client_id == filter_data.client_id)

    if filter_data.search:
        stmt = stmt.where(Order.id == filter_data.search)

    count_stmt = select(func.count()).select_from(stmt.subquery())
    total: int = await session.scalar(count_stmt)

    if filter_data.sort_order == "desc":
        stmt = stmt.order_by(sort_field.desc())
    else:
        stmt = stmt.order_by(sort_field.asc())

    result: Result = await session.execute(stmt)
    orders: list[Order] = list(result.scalars().all())

    return [
        OrderSchemaWithMaterials.from_orm_with_rels(order) for order in orders
    ], total


async def get_order_by_id_service(
    session: AsyncSession, order_id: str
) -> OrderSchemaWithMaterials | OrderSchemaWithMaterials:
    order: Order = await get_order(session=session, order_id=order_id)
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"order with id:{order_id} not found",
        )

    return OrderSchemaWithMaterials.from_orm_with_rels(order)


async def products_update_service(
    session: AsyncSession, order_id: str, products: list[OrderItemCreate]
) -> OrderSchemaWithMaterials:
    order: Order = await get_order(session=session, order_id=order_id)

    if order.status != 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Wrong order status!",
        )

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"order with id:{order_id} not found",
        )

    await set_order_products(session=session, order=order, products=products)

    await session.commit()
    await session.refresh(order, ["products_detail"])
    return OrderSchemaWithMaterials.from_orm_with_rels(order)


async def set_order_product_materials_service(
    session: AsyncSession, or_prod: OrderProductModel
):
    rels = []

    for prod_mat in or_prod.product.material_detail:  # type: ProductMaterialModel
        rels.append(
            OrderProductMaterial(
                order_product=or_prod,
                material_id=prod_mat.material_id,
                qty_prod_in_mat=prod_mat.quantity_in_one_mat_unit,
                material_price=prod_mat.material.one_item_price,
                budged_usage=materials_count(
                    mat_in_one_product=prod_mat.quantity_in_one_mat_unit,
                    product_qty=or_prod.quantity,
                ),
                actual_usage=materials_count(
                    mat_in_one_product=prod_mat.quantity_in_one_mat_unit,
                    product_qty=or_prod.quantity,
                ),
            )
        )
    session.add_all(rels)


async def order_confirm_service(
    session: AsyncSession,
    order_id: str,
) -> OrderSchemaWithMaterials:
    stmt = (
        select(Order)
        .options(
            selectinload(Order.products_detail).options(
                selectinload(OrderProductModel.product)
                .selectinload(Product.material_detail)
                .selectinload(ProductMaterialModel.material),
                selectinload(OrderProductModel.materials),
            )
        )
        .order_by(Order.created_date)
        .where(Order.id == order_id)
    )
    result: Result = await session.execute(stmt)
    order: Order | None = result.scalars().one_or_none()

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"order with id:{order_id} not found",
        )

    if order.status != 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Can not confirm order with status:{order.status}",
        )

    for op in order.products_detail:  # type: OrderProductModel
        await set_order_product_materials_service(session=session, or_prod=op)

    for order_prod in order.products_detail:
        for m in order_prod.materials:
            db_material: Material = await get_material_by_id(
                session=session, material_id=m.material_id
            )
            if db_material.count_left >= m.actual_usage:
                db_material.count_left -= m.actual_usage
                order.materials_price += m.actual_usage * m.material_price
            else:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Not enough material:{m.material.name}",
                )

    order.status = OrderStatus.IN_PROGRESS.value

    order.hiring_date = datetime.now(UTC).replace(tzinfo=None)
    await session.commit()

    order: Order = await get_order(session=session, order_id=order_id)
    return OrderSchemaWithMaterials.from_orm_with_rels(order)


async def payment_add_service(
    session: AsyncSession, order_id: str, payment: int | float
) -> OrderSchemaWithMaterials:
    if payment <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"payment is 0 or lower",
        )
    else:
        payment = payment * 100

    order: Order | None = await get_order(session=session, order_id=order_id)

    if order.status in [0, 6, 5]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Can not add payment order with status:{order.status}",
        )

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"order with id:{order_id} not found",
        )

    if order.paid + payment <= order.total_price:
        print(order.paid + payment)
        print(order.total_price)
        order.paid += payment

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Wrong payment amount, recomended sum {order.remains / 100}",
        )

    await session.commit()
    await session.refresh(order)

    return OrderSchemaWithMaterials.from_orm_with_rels(order)


async def increase_actual_material_usage_service(
    session: AsyncSession,
    order_id: str,
    materials: list[OrderAppendMaterialsSchema],
) -> OrderSchemaWithMaterials:
    # Получаем заказ
    order: Order = await get_order(session=session, order_id=order_id)
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id:{order_id} not found",
        )

    # Проверяем статус заказа
    if order.status != 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot update materials for order with status: {order.status}",
        )

    # Создаем словарь для быстрого доступа
    materials_dict = {item.id: item for item in materials}
    material_ids = list(materials_dict.keys())

    # Получаем материалы с двойным JOIN через промежуточные модели
    stmt = (
        select(OrderProductMaterial)
        .join(
            OrderProductModel,
            OrderProductMaterial.order_product_id == OrderProductModel.id,
        )
        .join(Order, OrderProductModel.order_id == Order.id)
        .where(
            OrderProductMaterial.id.in_(material_ids),
            Order.id == order_id,  # Проверяем принадлежность к заказу
        )
    )

    result: Result = await session.execute(stmt)
    order_materials = result.scalars().all()

    # Проверяем, что все материалы найдены и принадлежат заказу
    found_ids = {mat.id for mat in order_materials}
    if len(found_ids) != len(material_ids):
        not_found_ids = set(material_ids) - found_ids
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Materials not found or not belonging to order: {not_found_ids}",
        )

    # Обновляем actual_usage
    for order_mat in order_materials:
        order_mat.actual_usage = materials_dict[order_mat.id].actual_usage

    await session.commit()

    # Возвращаем обновленный заказ
    updated_order: Order = await get_order(session=session, order_id=order_id)
    return OrderSchemaWithMaterials.from_orm_with_rels(updated_order)


async def order_ready_service(
    session: AsyncSession,
    order_id: str,
) -> OrderSchemaWithMaterials:

    order: Order = await get_order(session=session, order_id=order_id)

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id:{order_id} not found",
        )

    if order.status != 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Order cannot be ready ,because order status:{order.status}",
        )

    order.status = OrderStatus.READY.value
    order.ready_date = datetime.now(UTC).replace(tzinfo=None)
    await session.commit()
    stmt = (
        select(Order)
        .options(
            selectinload(Order.products_detail)
            .selectinload(OrderProductModel.materials)
            .selectinload(OrderProductMaterial.material),
        )
        .where(Order.id == order_id)
    )

    result: Result = await session.execute(stmt)
    order: Order = result.scalars().one_or_none()
    return OrderSchemaWithMaterials.from_orm_with_rels(order)


async def order_complete_service(
    session: AsyncSession, order_id: str
) -> OrderSchemaWithMaterials:

    order: Order = await get_order(session=session, order_id=order_id)

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id:{order_id} not found",
        )

    if order.status != 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Order cannot be complete ,because order status:{order.status}",
        )

    if order.paid != order.total_price:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Order cannot be complete ,because order:{order.id} not paid, remains:{order.remains / 100}",
        )

    order.status = OrderStatus.COMPLETED.value
    order.completed_date = datetime.now(UTC).replace(tzinfo=None)

    await session.commit()
    await session.refresh(order)
    return OrderSchemaWithMaterials.from_orm_with_rels(order)


async def order_cancel_service(
    session: AsyncSession, order_id: str
) -> OrderSchemaWithMaterials:
    order: Order = await get_order(session=session, order_id=order_id)

    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with id:{order_id} not found",
        )

    if order.status not in [0, 2, 3]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Order cannot be canceled ,because order status:{order.status}",
        )

    order.status = OrderStatus.CANCELED.value
    order.canceled_date = datetime.now(UTC).replace(tzinfo=None)

    await session.commit()
    await session.refresh(order)

    return OrderSchemaWithMaterials.model_validate(order)
