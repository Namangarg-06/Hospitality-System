from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

class MenuCategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    display_order: int = 0

class MenuCategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None

class MenuCategoryResponse(BaseModel):
    id: int
    workspace_id: int
    name: str
    description: Optional[str] = None
    display_order: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class MenuItemCreate(BaseModel):
    category_id: int
    name: str
    short_description: Optional[str] = None
    long_description: Optional[str] = None
    description_hi: Optional[str] = None
    description_hinglish: Optional[str] = None
    price: float
    currency: str = "INR"
    ingredients: Optional[List[str]] = []
    allergens: Optional[List[str]] = []
    dietary_badges: Optional[List[str]] = []  # ["veg", "vegan", "gluten-free", "jain", "chef-special"]
    spice_level: str = "mild"
    image_url: Optional[str] = None
    is_available: bool = True
    is_published: bool = True
    preparation_time_minutes: int = 15
    calories: Optional[int] = None
    is_chef_special: bool = False
    search_keywords: Optional[List[str]] = []

class MenuItemUpdate(BaseModel):
    category_id: Optional[int] = None
    name: Optional[str] = None
    short_description: Optional[str] = None
    long_description: Optional[str] = None
    description_hi: Optional[str] = None
    description_hinglish: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    ingredients: Optional[List[str]] = None
    allergens: Optional[List[str]] = None
    dietary_badges: Optional[List[str]] = None
    spice_level: Optional[str] = None
    image_url: Optional[str] = None
    is_available: Optional[bool] = None
    is_published: Optional[bool] = None
    preparation_time_minutes: Optional[int] = None
    calories: Optional[int] = None
    is_chef_special: Optional[bool] = None
    search_keywords: Optional[List[str]] = None

class MenuItemResponse(BaseModel):
    id: int
    workspace_id: int
    category_id: int
    name: str
    short_description: Optional[str] = None
    long_description: Optional[str] = None
    description_hi: Optional[str] = None
    description_hinglish: Optional[str] = None
    price: float
    currency: str
    ingredients: Optional[List[str]] = []
    allergens: Optional[List[str]] = []
    dietary_badges: Optional[List[str]] = []
    spice_level: str
    image_url: Optional[str] = None
    is_available: bool
    is_published: bool
    preparation_time_minutes: Optional[int] = 15
    calories: Optional[int] = None
    is_chef_special: bool
    search_keywords: Optional[List[str]] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DescriptionGenerateRequest(BaseModel):
    dish_name: str
    category_name: Optional[str] = None
    key_ingredients: Optional[List[str]] = []
    dietary_type: Optional[str] = "Vegetarian"  # "Vegetarian" | "Non-Vegetarian" | "Vegan"

class DescriptionGenerateResponse(BaseModel):
    short_description: str
    long_description: str
    description_hi: str
    description_hinglish: str
    suggested_allergens: List[str]
    suggested_keywords: List[str]

class ExtractedCandidateDish(BaseModel):
    category: str
    name: str
    price: float
    description: Optional[str] = None
    dietary_badges: List[str] = []
    allergens: List[str] = []

class MenuExtractionPreviewResponse(BaseModel):
    job_id: int
    document_id: int
    status: str
    raw_text_sample: str
    extracted_dishes: List[ExtractedCandidateDish]
    total_found: int

class MenuApproveImportRequest(BaseModel):
    items: List[ExtractedCandidateDish]
