from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class FoodWasteRecordCreate(BaseModel):
    item_name: str
    is_dish: bool = True
    quantity: float
    unit: str = "kg"  # kg, portions, liters
    date_time: Optional[datetime] = None
    reason: str = "OVER_PREPARATION" # OVER_PREPARATION, SPOILAGE, PLATE_WASTE, PREPARATION_ERROR, EXPIRED, OTHER
    estimated_cost: float = 0.0
    notes: Optional[str] = None

class FoodWasteRecordResponse(BaseModel):
    id: int
    workspace_id: int
    item_name: str
    is_dish: bool
    quantity: float
    unit: str
    date_time: datetime
    reason: str
    estimated_cost: float
    currency: str
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class WasteSummaryResponse(BaseModel):
    total_waste_records: int
    total_waste_cost: float
    total_waste_quantity_kg: float
    currency: str
    reason_breakdown: List[Dict[str, Any]]
    top_wasted_items: List[Dict[str, Any]]
    trend_by_date: List[Dict[str, Any]]
    actionable_reduction_recommendations: List[str]
