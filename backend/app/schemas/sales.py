from datetime import date, datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class SalesRecordCreate(BaseModel):
    record_date: date
    gross_sales: float
    net_sales: float
    discount_amount: float = 0.0
    refund_amount: float = 0.0
    tax_collected: float = 0.0
    total_orders: int
    average_order_value: float
    notes: Optional[str] = None
    source: str = "CSV_IMPORT"

class SalesRecordResponse(BaseModel):
    id: int
    workspace_id: int
    record_date: date
    gross_sales: float
    net_sales: float
    discount_amount: float
    refund_amount: float
    tax_collected: float
    total_orders: int
    average_order_value: float
    currency: str
    source: str
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class DishSalesPerformance(BaseModel):
    item_name: str
    category_name: Optional[str]
    quantity_sold: int
    total_revenue: float
    average_price: float

class SalesAnalyticsSummary(BaseModel):
    total_revenue: float
    net_sales: float
    total_orders: int
    average_order_value: float
    total_discounts: float
    total_refunds: float
    currency: str
    period_start: date
    period_end: date
    daily_trend: List[Dict[str, Any]]
    top_selling_dishes: List[DishSalesPerformance]
    slow_moving_dishes: List[DishSalesPerformance]
    category_breakdown: List[Dict[str, Any]]
