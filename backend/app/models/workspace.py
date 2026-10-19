from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON, Float
from sqlalchemy.orm import relationship
from app.db.session import Base

class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    restaurant_type = Column(String(100), default="Fine Dining", nullable=False)
    description = Column(Text, nullable=True)
    address = Column(String(500), nullable=True)
    city = Column(String(100), default="New Delhi", nullable=True)
    phone = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    currency = Column(String(10), default="INR", nullable=False)
    timezone = Column(String(100), default="Asia/Kolkata", nullable=False)
    logo_url = Column(String(500), nullable=True)
    whatsapp_number = Column(String(50), nullable=True)
    google_review_url = Column(String(500), nullable=True)
    instagram_url = Column(String(500), nullable=True)
    website_url = Column(String(500), nullable=True)
    upi_id = Column(String(100), nullable=True)
    wifi_name = Column(String(100), nullable=True)
    wifi_password = Column(String(100), nullable=True)
    pdf_menu_url = Column(String(500), nullable=True)
    pdf_menu_filename = Column(String(255), nullable=True)
    custom_links = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    memberships = relationship("WorkspaceMembership", back_populates="workspace", cascade="all, delete-orphan")
    settings = relationship("RestaurantSettings", back_populates="workspace", uselist=False, cascade="all, delete-orphan")
    categories = relationship("MenuCategory", back_populates="workspace", cascade="all, delete-orphan")
    menu_items = relationship("MenuItem", back_populates="workspace", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="workspace", cascade="all, delete-orphan")
    reviews = relationship("CustomerReview", back_populates="workspace", cascade="all, delete-orphan")
    sales_records = relationship("SalesRecord", back_populates="workspace", cascade="all, delete-orphan")
    waste_records = relationship("FoodWasteRecord", back_populates="workspace", cascade="all, delete-orphan")
    action_insights = relationship("ActionInsight", back_populates="workspace", cascade="all, delete-orphan")

class WorkspaceMembership(Base):
    __tablename__ = "workspace_memberships"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(50), default="OWNER", nullable=False)  # OWNER, MANAGER, STAFF
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="memberships")
    workspace = relationship("Workspace", back_populates="memberships")

class RestaurantSettings(Base):
    __tablename__ = "restaurant_settings"

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), unique=True, nullable=False)
    opening_hours = Column(JSON, nullable=True)  # {"monday": {"open": "11:00", "close": "23:00"}, ...}
    menu_categories_list = Column(JSON, nullable=True)  # ["Starters", "Main Course", "Breads", "Desserts", "Beverages"]
    supported_languages = Column(JSON, default=["en", "hi"], nullable=True)
    ordering_enabled = Column(Boolean, default=True, nullable=False)
    table_ordering_enabled = Column(Boolean, default=True, nullable=False)
    takeaway_enabled = Column(Boolean, default=True, nullable=False)
    tax_rate_percent = Column(Float, default=5.0, nullable=False)  # e.g., 5% GST
    service_charge_percent = Column(Float, default=0.0, nullable=False)
    demo_mode = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    workspace = relationship("Workspace", back_populates="settings")
