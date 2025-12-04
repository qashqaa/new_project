from pydantic import BaseModel, EmailStr, Field


class CreateUserSchema(BaseModel):
    username: str = Field(min_length=3, max_length=32)
    email: EmailStr
    password: str


class UserSchema(BaseModel):
    id: str
    username: str
    email: EmailStr
    role: str
    model_config = {"from_attributes": True}  # Pydantic v2: разрешаем из SQLAlchemy


class LoginSchema(BaseModel):
    email: EmailStr = Field()
    password: str = Field()
