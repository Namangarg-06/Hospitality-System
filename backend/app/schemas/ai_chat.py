from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class CustomerAIChatMessage(BaseModel):
    role: str  # "user" | "assistant" | "system"
    content: str

class CustomerAIChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[CustomerAIChatMessage]] = []
    dietary_filter: Optional[str] = None
    table_number: Optional[str] = None

class DishRecommendationCitation(BaseModel):
    dish_id: int
    name: str
    price: float
    currency: str
    dietary_badges: List[str] = []
    allergens: List[str] = []
    image_url: Optional[str] = None
    spice_level: str
    confidence_rationale: str

class CustomerAIChatResponse(BaseModel):
    reply: str
    recommended_dishes: List[DishRecommendationCitation] = []
    grounded_in_menu: bool = True
    suggested_followups: List[str] = []
