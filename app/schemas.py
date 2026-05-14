from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime
from typing import Optional

# --- REQUEST SCHEMAS ---

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenRefreshRequest(BaseModel):
    refresh_token: str

# --- RESPONSE SCHEMAS (STRICT PER SPEC) ---

class UserRegistrationResponse(BaseModel):
    id: int
    email: EmailStr
    is_active: bool = True
    is_superuser: bool = False
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TokenExchangeResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class StandardActionResponse(BaseModel):
    detail: str
