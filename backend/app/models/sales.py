from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float, Date
from sqlalchemy.orm import relationship
from app.db.session import Base

class SalesRecord(Base):
    __tablename__ = "sales_records"

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    record_date = Column(Date, nullable=False, index=True)
    gross_sales = Column(Float, nullable=False, default=0.0)
    net_sales = Column(Float, nullable=False, default=0.0)
    discount_amount = Column(Float, nullable=False, default=0.0)
    refund_amount = Column(Float, nullable=False, default=0.0)
    tax_collected = Column(Float, nullable=False, default=0.0)
    total_orders = Column(Integer, nullable=False, default=0)
    average_order_value = Column(Float, nullable=False, default=0.0)
    currency = Column(String(10), default="INR", nullable=False)
    source = Column(String(50), default="ORDERS_SYSTEM", nullable=False) # ORDERS_SYSTEM, CSV_IMPORT
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    workspace = relationship("Workspace", back_populates="sales_records")

class SalesImport(Base):
    __tablename__ = "sales_imports"

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    file_name = Column(String(255), nullable=False)
    row_count = Column(Integer, nullable=False, default=0)
    total_sales_imported = Column(Float, nullable=False, default=0.0)
    status = Column(String(50), default="SUCCESS", nullable=False) # SUCCESS, WARNING, FAILED
    error_details = Column(Text, nullable=True)
    imported_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
