from datetime import datetime
from typing import Optional

from pydantic import (
    BaseModel,
    field_validator,
    Field,
    NonNegativeInt,
    ConfigDict,
)

from core.models import Product


class ProductPriceItemSchema(BaseModel):
    id: int
    start: NonNegativeInt
    end: NonNegativeInt
    price: int | float
    description: Optional[str] = None

    @field_validator("price")
    @classmethod
    def convert_price_to_sum(cls, price):
        if price is None:
            return None
        return price / 100


class ProductCreateSchema(BaseModel):
    name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Название продукта",
    )
    size: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Размеры продукта",
    )
    detail: str | None = Field(
        None, min_length=1, max_length=100, description="Дополнительная информация"
    )
    description: str | None = Field(
        None, min_length=1, max_length=1000, description="Описание продукта"
    )

    @field_validator("name")
    @classmethod
    def lower_name(cls, v: str):
        return v.strip().lower()

    @field_validator("size")
    @classmethod
    def lower_size(cls, v: str):
        return v.strip().lower()

    model_config = ConfigDict(from_attributes=True, extra="forbid")


class ProductMaterialSchema(BaseModel):
    id: int
    material_name: str
    material_type: str
    material_detail: Optional[str] = None
    product_id: str
    material_id: str
    quantity_in_one_mat_unit: int

    model_config = ConfigDict(from_attributes=True, extra="forbid")

    @field_validator("material_name")
    @classmethod
    def capitalize_name(cls, material_name: str):
        return material_name.capitalize()

    @field_validator("material_type")
    @classmethod
    def capitalize_type(cls, material_name: str):
        return material_name.capitalize()


## на выход
class ProductSchema(BaseModel):
    id: str
    name: str
    size: str
    detail: str | None = None
    description: str | None = None

    create_at: datetime
    status: int

    material_detail: list[ProductMaterialSchema]
    price_tier: list[ProductPriceItemSchema]

    model_config = {"from_attributes": True}

    @field_validator("name")
    @classmethod
    def capitalize_name(cls, name: str):
        return name.capitalize()

    @classmethod
    def from_orm_with_materials(cls, product: Product) -> "ProductSchema":
        # Вручную конвертируем material_details
        material_details = []
        price_tier = []
        for detail in product.material_detail:
            material_details.append(
                ProductMaterialSchema(
                    id=detail.id,
                    product_id=detail.product_id,
                    material_id=detail.material_id,
                    material_name=detail.material.name,  # ← используем связь
                    material_type=detail.material.material_type,
                    material_detail=detail.material.detail,
                    quantity_in_one_mat_unit=detail.quantity_in_one_mat_unit,
                )
            )

        for price in product.price_tier:
            price_tier.append(
                ProductPriceItemSchema(
                    id=price.id,
                    start=price.start,
                    end=price.end,
                    price=price.price,
                    description=price.description,
                )
            )

        return cls(
            id=product.id,
            status=product.status,
            name=product.name,
            size=product.size,
            detail=product.detail,
            description=product.description,
            create_at=product.create_at,
            material_detail=material_details,
            price_tier=price_tier,
        )


class ProductFilterSchema(BaseModel):
    # Пагинация
    skip: Optional[int] = Field(0, ge=0, description="Пропустить записей")
    limit: Optional[int] = Field(12, ge=1, le=1000, description="Лимит на страницу")

    # Фильтры
    name: Optional[str] = Field(None, description="Фильтр по названию")
    size: Optional[str] = Field(None, description="Фильтр по размеру")
    detail: Optional[str] = Field(None, description="Фильтр по деталям")
    search: Optional[str] = Field(None, description="Поиск по названию")

    # Сортировка
    sort_by: Optional[str] = Field("name", description="Поле для сортировки")
    sort_order: Optional[str] = Field("asc", description="Порядок сортировки")


class ProductPartialUpdateSchema(BaseModel):
    status: Optional[NonNegativeInt] = None
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    size: Optional[str] = Field(None, min_length=1, max_length=100)
    detail: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, min_length=1, max_length=1000)

    @field_validator("name")
    @classmethod
    def lower_name(cls, v: str):
        if v is None:
            return None
        return v.strip().lower()

    @field_validator("size")
    @classmethod
    def lower_size(cls, v: str):
        if v is None:
            return None
        return v.strip().lower()
