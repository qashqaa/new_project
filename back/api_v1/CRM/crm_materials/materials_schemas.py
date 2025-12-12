from datetime import datetime

from pydantic import (
    BaseModel,
    Field,
    NonNegativeInt,
    field_validator,
    NonNegativeFloat,
    ConfigDict,
)
from typing import Optional


## схема на вход
class MaterialCreateSchema(BaseModel):
    name: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Название материала",
    )
    material_type: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Тип материала",
    )
    detail: Optional[str] = Field(None, max_length=500, description="Детали")
    description: Optional[str] = Field(None, max_length=1000, description="Описание")
    count_in_one_pack: NonNegativeInt = Field(..., description="Количество в упаковке")
    pack_price: NonNegativeFloat = Field(
        ..., description="Цена в UZS"
    )  # ← Фронтенд присылает UZS (10,000)
    count_left: NonNegativeInt = Field(..., description="Остаток на складе")

    @field_validator("name")
    @classmethod
    def lower_name(cls, v: str):
        return v.strip().lower()

    @field_validator("material_type")
    @classmethod
    def lower_mat_type(cls, v: str):
        return v.strip().lower()

    @field_validator("pack_price")
    @classmethod
    def convert_price_to_tiyin(cls, price):
        if price == 0:
            return 0
        return int(price * 100)


## схема на выход
class MaterialSchema(BaseModel):
    id: str
    name: str
    material_type: str
    detail: Optional[str] = None
    description: Optional[str] = None

    create_at: datetime
    status: int

    pack_price: int | float
    one_item_price: int | float
    count_in_one_pack: int
    count_left: int

    model_config = {"from_attributes": True}

    @field_validator("pack_price")
    @classmethod
    def convert_to_uzs_pack(cls, pack_price):
        if pack_price == 0:
            return 0
        """Конвертирует тийины в UZS для фронтенда"""
        return int(pack_price / 100)  # 1,000,000 → 10,000 UZS

    @field_validator("one_item_price")
    @classmethod
    def convert_to_uzs_one(cls, one_item_price):
        if one_item_price == 0:
            return 0
        """Конвертирует тийины в UZS для фронтенда"""
        return int(one_item_price / 100)  # 1,000,000 → 10,000 UZS

    @field_validator("name")
    @classmethod
    def capitalize_name(cls, name: str):
        return name.capitalize()

    @field_validator("material_type")
    @classmethod
    def capitalize_type(cls, name: str):
        return name.capitalize()


## схема на вход
class MaterialAppendSchema(BaseModel):
    delta: int = Field(ge=-9999, le=9999)


## схема на вход
class MaterialFilterSchema(BaseModel):
    # Пагинация
    skip: Optional[int] = Field(0, ge=0, description="Пропустить записей")
    limit: Optional[int] = Field(12, ge=1, le=1000, description="Лимит на страницу")

    # Фильтры
    material_type: Optional[str] = Field(None, description="Фильтр по типу")
    search: Optional[str] = Field(None, description="Поиск по названию")

    # Сортировка
    sort_by: Optional[str] = Field("name", description="Поле для сортировки")
    sort_order: Optional[str] = Field("asc", description="Порядок сортировки")


class MaterialPartialUpdateSchema(BaseModel):
    status: Optional[int] = None
    name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=100,
    )
    material_type: Optional[str] = Field(
        None,
        min_length=1,
        max_length=100,
    )
    detail: Optional[str] = Field(
        None,
        min_length=1,
        max_length=100,
    )
    description: Optional[str] = Field(
        None,
        min_length=1,
        max_length=100,
    )
    count_in_one_pack: Optional[NonNegativeInt] = None
    pack_price: Optional[NonNegativeFloat] = None  # ← Фронтенд присылает UZS (10,000)

    @field_validator("pack_price")
    @classmethod
    def convert_price_to_tiyin(cls, pack_price):
        if pack_price is None:
            return None
        return int(pack_price * 100)

    @field_validator("name")
    @classmethod
    def lower_name(cls, v: str):
        if v is None:
            return None
        return v.strip().lower()

    @field_validator("material_type")
    @classmethod
    def lower_mat_type(cls, v: str):
        if v is None:
            return None
        return v.strip().lower()

    model_config = ConfigDict(from_attributes=True)


# class MaterialGetSchema(BaseModel):
#     material_id: str
