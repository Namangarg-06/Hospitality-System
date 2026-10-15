from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Float, JSON
from sqlalchemy.orm import relationship
from app.db.session import Base

class ActionInsight(Base):
    __tablename__ = "action_insights"

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), default="OPERATIONS", nullable=False) # SERVICE, PRICING, WASTE, ORDERS, MENU, REVIEWS
    severity = Column(String(50), default="WARNING", nullable=False) # CRITICAL, WARNING, OPTIMIZATION, NOTICE
    explanation = Column(Text, nullable=False)
    supporting_evidence = Column(JSON, default=list, nullable=True) # List of quotes, data points, or discrepancies
    source_records = Column(JSON, default=list, nullable=True) # e.g. [{"entity": "menu_item", "id": 12}, {"entity": "review", "id": 5}]
    recommended_next_step = Column(Text, nullable=False)
    status = Column(String(50), default="OPEN", nullable=False) # OPEN, IN_PROGRESS, RESOLVED, DISMISSED
    confidence_score = Column(Float, default=0.9, nullable=False) # 0.0 to 1.0
    assigned_to_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    workspace = relationship("Workspace", back_populates="action_insights")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action_type = Column(String(100), nullable=False) # CREATE_ITEM, UPDATE_PRICE, APPROVE_REPLY, RESOLVE_ACTION, etc.
    entity_type = Column(String(100), nullable=False) # MenuItem, Order, ReviewReplyDraft, etc.
    entity_id = Column(Integer, nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
