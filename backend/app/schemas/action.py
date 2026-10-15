from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class ActionInsightResponse(BaseModel):
    id: int
    workspace_id: int
    title: str
    category: str
    severity: str
    explanation: str
    supporting_evidence: List[Any] = []
    source_records: List[Dict[str, Any]] = []
    recommended_next_step: str
    status: str
    confidence_score: float
    assigned_to_user_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ActionInsightStatusUpdate(BaseModel):
    status: str  # OPEN, IN_PROGRESS, RESOLVED, DISMISSED
    assigned_to_user_id: Optional[int] = None
