from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    organization_id: str
    role: str


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: str
    is_active: bool


class Token(BaseModel):
    access_token: str
    token_type: str
