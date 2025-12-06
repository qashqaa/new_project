from typing import Optional

from pydantic import (
    BaseModel,
    ConfigDict,
    PositiveInt,
    NonNegativeInt,
    Field,
    field_validator,
)


class ProductMaterialCreateSchema(BaseModel):
    material_id: str
    quantity_in_one_mat_unit: PositiveInt
    model_config = ConfigDict(from_attributes=True)


class ProductPriceCreateSchema(BaseModel):
    start: int
    end: int
    price: NonNegativeInt
    description: Optional[str] = Field(None, min_length=3)

    @field_validator("price")
    @classmethod
    def convert_to_tiyin(cls, price):
        return price * 100

    model_config = ConfigDict(from_attributes=True)


class ProductPriceUpdateSchema(BaseModel):
    start: Optional[NonNegativeInt] = None
    end: Optional[NonNegativeInt] = None
    price: Optional[int | float] = None
    description: Optional[str] = Field(None, min_length=3)

    @field_validator("price")
    @classmethod
    def convert_to_tiyin(cls, price):
        if price:
            return price * 100
        return None

    model_config = ConfigDict(from_attributes=True)
