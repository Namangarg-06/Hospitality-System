from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class OrderItemCreate(BaseModel):
    menu_item_id: int
    quantity: int = 1
    notes: Optional[str] = None

class OrderCreateRequest(BaseModel):
    customer_name: Optional[str] = "Guest"
    customer_phone: Optional[str] = None
    order_type: str = "DINE_IN"  # DINE_IN, TAKEAWAY
    table_number: Optional[str] = None
    notes: Optional[str] = None
    items: List[OrderItemCreate]

class OrderStatusUpdateRequest(BaseModel):
    status: str  # PENDING, ACCEPTED, PREPARING, READY, COMPLETED, CANCELLED
    notes: Optional[str] = None

class OrderItemResponse(BaseModel):
    id: int
    menu_item_id: Optional[int]
    item_name: str
    unit_price: float
    quantity: int
    item_total: float
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    workspace_id: int
    order_number: str
    customer_name: Optional[str]
    customer_phone: Optional[str]
    order_type: str
    table_number: Optional[str]
    status: str
    subtotal: float
    tax_amount: float
    service_charge: float
    total_amount: float
    currency: str
    notes: Optional[str]
    is_paid: bool
    payment_method: Optional[str]
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True
