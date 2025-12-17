from datetime import datetime, date
from typing import Optional, List

from pydantic import BaseModel, Field, PositiveInt, field_validator, NonNegativeInt

from core.models import Order
from core.models import OrderProductModel


class CreateOrderAdditionalCoastSchema(BaseModel):
    cost: int | float
    description: str

    model_config = {"from_attributes": True}

    @field_validator("cost")
    @classmethod
    def convert_to_tiyin(cls, cost):
        return cost * 100


class OrderAdditionalCoastSchema(BaseModel):
    id: int
    order_id: str
    cost: int
    description: str
    model_config = {"from_attributes": True}

    @field_validator("cost")
    @classmethod
    def convert_to_sum(cls, cost):
        return int(cost / 100)


class OrderProductItem(BaseModel):
    id: int
    order_product_id: int
    material_id: Optional[str] = None
    material_name: str
    material_type: str
    qty_prod_in_mat: int
    budged_usage: int
    actual_usage: int
    material_price: int

    @field_validator("material_price")
    @classmethod
    def convert_price_to_tiyin(cls, price):
        if price is None:
            return None
        return int(price / 100)

    model_config = {"from_attributes": True}

    @field_validator("material_name")
    @classmethod
    def capitalize_mat_name(cls, v: str):
        return v.capitalize()


class OrderItemCreate(BaseModel):
    product_id: str
    quantity: PositiveInt


class OrderItemWithoutMaterials(BaseModel):
    id: int
    order_id: str
    product_id: Optional[str] = None
    product_name: str
    product_size: str
    product_detail: Optional[str] = None
    product_price: int
    quantity: int
    model_config = {"from_attributes": True}

    @field_validator("product_price")
    @classmethod
    def convert_price_to_tiyin(cls, price):
        if price is None:
            return None
        return int(price / 100)

    @field_validator("product_name")
    @classmethod
    def capitalize_mat_name(cls, v: str):
        return v.capitalize()


class OrderItemWithMaterials(BaseModel):
    id: int
    order_id: str
    product_id: Optional[str] = None
    product_name: str
    product_size: str
    product_detail: Optional[str] = None
    product_price: int
    quantity: int
    materials: Optional[List[OrderProductItem]] = Field(default_factory=list)
    model_config = {"from_attributes": True}

    @field_validator("product_price")
    @classmethod
    def convert_price_to_tiyin(cls, price):
        if price is None:
            return None
        return int(price / 100)

    @field_validator("product_name")
    @classmethod
    def capitalize_mat_name(cls, v: str):
        return v.capitalize()


class OrderCreateSchema(BaseModel):
    user_id: Optional[str] = None
    client_id: Optional[str] = None
    customer: str = Field(None, max_length=45, min_length=3)
    descriptions: Optional[str] = None


class OrderPartialUpdateSchema(BaseModel):
    customer: Optional[str] = None
    description: Optional[str] = None


class OrderSchema(BaseModel):
    id: str
    status: int
    total_price: float | int
    materials_price: float | int
    customer: Optional[str] = None
    descriptions: Optional[str] = None
    created_date: datetime
    hiring_date: Optional[datetime] = None
    ready_date: Optional[datetime] = None
    completed_date: Optional[datetime] = None
    canceled_date: Optional[datetime] = None
    paid: int | float

    client_id: Optional[str] = None
    user_id: Optional[str] = None

    products_detail: list[OrderItemWithMaterials]
    costs: list[OrderAdditionalCoastSchema]

    model_config = {"from_attributes": True}

    @field_validator("total_price")
    @classmethod
    def convert_t_price_to_tiyin(cls, price):
        if price is None:
            return None
        return int(price / 100)

    @field_validator("materials_price")
    @classmethod
    def convert_m_price_to_tiyin(cls, price):
        if price is None:
            return None
        return int(price / 100)

    @field_validator("paid")
    @classmethod
    def convert_to_tiyin(cls, price):
        if price is None:
            return None
        return int(price / 100)

    @classmethod
    def from_orm_with_rels(cls, order: Order) -> "OrderSchema":
        products_detail = []
        costs = [
            OrderAdditionalCoastSchema(
                id=cost.id,
                order_id=cost.order_id,
                cost=cost.cost,
                description=cost.description,
            )
            for cost in order.costs
        ]
        for detail in order.products_detail:  # type: OrderProductModel
            products_detail.append(
                OrderItemWithMaterials(
                    id=detail.id,
                    order_id=detail.order_id,
                    product_id=getattr(detail.product_id, "product_id", None),
                    product_price=detail.product_price,
                    quantity=detail.quantity,
                    product_name=getattr(detail.product, "name", "Удален"),
                    product_size=getattr(detail.product, "size", "Неизвестно"),
                    product_detail=getattr(detail.product, "detail", "Неизвестно"),
                    materials=[
                        OrderProductItem(
                            id=mat.id,
                            material_id=getattr(mat.material_id, "material_id", None),
                            order_product_id=mat.order_product_id,
                            material_name=getattr(
                                mat.material, "name", "Материал удален"
                            ),
                            material_type=getattr(
                                mat.material, "material_type", "Неизвестно"
                            ),
                            qty_prod_in_mat=mat.qty_prod_in_mat,
                            material_price=mat.material_price,
                            budged_usage=mat.budged_usage,
                            actual_usage=mat.actual_usage,
                        )
                        for mat in detail.materials
                    ],
                )
            )

        return cls(
            id=order.id,
            status=order.status,
            customer=order.customer,
            descriptions=order.descriptions,
            created_date=order.created_date,
            hiring_date=order.hiring_date,
            ready_date=order.ready_date,
            completed_date=order.completed_date,
            canceled_date=order.canceled_date,
            paid=order.paid,
            total_price=order.total_price,
            materials_price=order.materials_price,
            products_detail=products_detail,
            client_id=order.client_id,
            user_id=order.user_id,
            costs=costs,
        )


class OrderFilterSchema(BaseModel):
    skip: Optional[int] = Field(0, ge=0, description="Пропустить записей")
    limit: Optional[int] = Field(12, ge=1, le=1000, description="Лимит на страницу")

    # Фильтры по датам
    created_date_from: Optional[date] = Field(None, description="Дата создания от")
    created_date_to: Optional[date] = Field(None, description="Дата создания до")

    # Фильтры
    customer: Optional[str] = Field(None, description="Фильтр по заказчику")
    status: Optional[int] = Field(None, description="Фильтр по статусу")
    used_id: Optional[str] = Field(None, description="Фильтр по пользователю")
    client_id: Optional[str] = Field(None, description="Поиск по клиенту")
    search: Optional[str] = Field(None, description="Поиск по айди заказа")

    # Сортировка
    sort_by: Optional[str] = Field("created_date", description="Поле для сортировки")
    sort_order: Optional[str] = Field("asc", description="Порядок сортировки")


class OrderAppendMaterialsSchema(BaseModel):
    id: NonNegativeInt
    actual_usage: int = Field(ge=0, description="Фактический расход материала")
