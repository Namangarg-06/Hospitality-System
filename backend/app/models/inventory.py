from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float
from sqlalchemy.orm import relationship
from app.db.session import Base

class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100), default="Raw Ingredient", nullable=False)
    current_stock = Column(Float, default=0.0, nullable=False)
    unit = Column(String(50), default="kg", nullable=False) # kg, g, l, ml, units, portions
    reorder_level = Column(Float, default=5.0, nullable=False)
    cost_per_unit = Column(Float, default=0.0, nullable=False)
    currency = Column(String(10), default="INR", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class FoodWasteRecord(Base):
    __tablename__ = "food_waste_records"

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    item_name = Column(String(255), nullable=False, index=True)
    is_dish = Column(Boolean, default=True, nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String(50), default="kg", nullable=False) # kg, portions, liters
    date_time = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    reason = Column(String(100), default="OVER_PREPARATION", nullable=False)
    # Reasons: OVER_PREPARATION, SPOILAGE, PLATE_WASTE, PREPARATION_ERROR, EXPIRED, OTHER
    estimated_cost = Column(Float, default=0.0, nullable=False)
    currency = Column(String(10), default="INR", nullable=False)
    notes = Column(Text, nullable=True)
    recorded_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    workspace = relationship("Workspace", back_populates="waste_records")
