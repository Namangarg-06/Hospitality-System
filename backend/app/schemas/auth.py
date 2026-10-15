from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str
    user: "UserResponse"
    workspace: Optional["WorkspaceBasic"] = None

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    workspace_id: Optional[int] = None
    role: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    restaurant_name: Optional[str] = None
    restaurant_type: Optional[str] = "Fine Dining"

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    is_active: bool
    is_superuser: bool
    created_at: datetime

    class Config:
        from_attributes = True

class WorkspaceBasic(BaseModel):
    id: int
    name: str
    slug: str
    restaurant_type: str
    role: str
    currency: str

class SwitchWorkspaceRequest(BaseModel):
    workspace_id: int
