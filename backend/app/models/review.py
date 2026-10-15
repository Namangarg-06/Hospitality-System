from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, JSON
from sqlalchemy.orm import relationship
from app.db.session import Base

class CustomerReview(Base):
    __tablename__ = "customer_reviews"

    id = Column(Integer, primary_key=True, index=True)
    workspace_id = Column(Integer, ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    source = Column(String(50), default="MANUAL", nullable=False) # CSV_IMPORT, MANUAL, QR_FEEDBACK
    customer_name = Column(String(255), nullable=True)
    rating = Column(Integer, nullable=False) # 1 to 5
    review_text = Column(Text, nullable=False)
    review_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    sentiment = Column(String(50), default="NEUTRAL", nullable=False) # POSITIVE, NEUTRAL, NEGATIVE
    sentiment_score = Column(Float, default=0.0, nullable=False) # -1.0 to 1.0
    topics = Column(JSON, default=list, nullable=True) # ["food_quality", "service_speed", "cleanliness", etc.]
    recurring_complaint = Column(String(255), nullable=True) # e.g. "Slow service on weekends"
    status = Column(String(50), default="NEW", nullable=False) # NEW, REVIEWED, REPLIED
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    workspace = relationship("Workspace", back_populates="reviews")
    reply_drafts = relationship("ReviewReplyDraft", back_populates="review", cascade="all, delete-orphan")

class ReviewReplyDraft(Base):
    __tablename__ = "review_reply_drafts"

    id = Column(Integer, primary_key=True, index=True)
    review_id = Column(Integer, ForeignKey("customer_reviews.id", ondelete="CASCADE"), nullable=False, index=True)
    tone = Column(String(50), default="PROFESSIONAL", nullable=False) # PROFESSIONAL, WARM, CONCISE
    language = Column(String(20), default="EN", nullable=False) # EN, HI, HINGLISH
    draft_text = Column(Text, nullable=False)
    is_approved = Column(Boolean, default=False, nullable=False)
    approved_at = Column(DateTime, nullable=True)
    approved_by_user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    is_copied_or_published = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    review = relationship("CustomerReview", back_populates="reply_drafts")
