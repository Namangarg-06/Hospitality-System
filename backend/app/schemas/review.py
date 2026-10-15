from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class ReviewCreateRequest(BaseModel):
    customer_name: Optional[str] = "Anonymous Diner"
    rating: int  # 1 to 5
    review_text: str
    review_date: Optional[datetime] = None
    source: str = "MANUAL"

class ReviewResponse(BaseModel):
    id: int
    workspace_id: int
    source: str
    customer_name: Optional[str]
    rating: int
    review_text: str
    review_date: datetime
    sentiment: str
    sentiment_score: float
    topics: List[str] = []
    recurring_complaint: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class ReviewReplyDraftCreateRequest(BaseModel):
    review_id: int
    tone: str = "PROFESSIONAL"  # PROFESSIONAL, WARM, CONCISE
    language: str = "EN"        # EN, HI, HINGLISH

class ReviewReplyDraftResponse(BaseModel):
    id: int
    review_id: int
    tone: str
    language: str
    draft_text: str
    is_approved: bool
    approved_at: Optional[datetime] = None
    is_copied_or_published: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ReviewReplyApproveRequest(BaseModel):
    edited_text: Optional[str] = None

class SentimentIntelligenceSummary(BaseModel):
    total_reviews: int
    average_rating: float
    positive_count: int
    neutral_count: int
    negative_count: int
    positive_percentage: float
    recurring_complaints: List[Dict[str, Any]]
    positive_highlights: List[Dict[str, Any]]
    topic_distribution: Dict[str, int]
    sample_evidence: List[Dict[str, Any]]
