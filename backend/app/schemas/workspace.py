from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, EmailStr

class RestaurantSettingsBase(BaseModel):
    opening_hours: Optional[Dict[str, Any]] = None
    menu_categories_list: Optional[List[str]] = None
    supported_languages: Optional[List[str]] = ["en", "hi"]
    ordering_enabled: bool = True
    table_ordering_enabled: bool = True
    takeaway_enabled: bool = True
    tax_rate_percent: float = 5.0
    service_charge_percent: float = 0.0
    demo_mode: bool = False

class RestaurantSettingsUpdate(BaseModel):
    opening_hours: Optional[Dict[str, Any]] = None
    menu_categories_list: Optional[List[str]] = None
    supported_languages: Optional[List[str]] = None
    ordering_enabled: Optional[bool] = None
    table_ordering_enabled: Optional[bool] = None
    takeaway_enabled: Optional[bool] = None
    tax_rate_percent: Optional[float] = None
    service_charge_percent: Optional[float] = None
    demo_mode: Optional[bool] = None

class RestaurantSettingsResponse(RestaurantSettingsBase):
    id: int
    workspace_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class WorkspaceCreate(BaseModel):
    name: str
    restaurant_type: str = "Fine Dining"
    description: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = "New Delhi"
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    currency: str = "INR"
    timezone: str = "Asia/Kolkata"

class WorkspaceUpdate(BaseModel):
    name: Optional[str] = None
    restaurant_type: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    currency: Optional[str] = None
    timezone: Optional[str] = None
    logo_url: Optional[str] = None

class WorkspaceResponse(BaseModel):
    id: int
    name: str
    slug: str
    restaurant_type: str
    description: Optional[str]
    address: Optional[str]
    city: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    currency: str
    timezone: str
    logo_url: Optional[str]
    is_active: bool
    created_at: datetime
    settings: Optional[RestaurantSettingsResponse] = None

    class Config:
        from_attributes = True

class MemberInviteRequest(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "STAFF"  # MANAGER or STAFF
    temporary_password: Optional[str] = "DineAI@2026"

class MemberResponse(BaseModel):
    membership_id: int
    user_id: int
    email: str
    full_name: str
    role: str
    created_at: datetime
