import os
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.menu import MenuCategory, MenuItem
from app.models.document import DocumentUpload, DocumentExtractionJob
from app.schemas.menu import (
    MenuCategoryCreate, MenuCategoryUpdate, MenuCategoryResponse,
    MenuItemCreate, MenuItemUpdate, MenuItemResponse,
    DescriptionGenerateRequest, DescriptionGenerateResponse,
    MenuExtractionPreviewResponse, MenuApproveImportRequest
)
from app.services.ai.menu_description_service import menu_desc_service
from app.services.ai.menu_extraction import menu_extraction_service
from app.api.deps import get_current_user, get_current_workspace, require_role
from app.core.config import settings

router = APIRouter(prefix="/menus", tags=["Menu Studio"])

# ----------------- Categories -----------------

@router.get("/categories", response_model=List[MenuCategoryResponse])
def get_categories(
    workspace=Depends(get_current_workspace),
    db: Session = Depends(get_db)
):
    return db.query(MenuCategory).filter(
        MenuCategory.workspace_id == workspace.id
    ).order_by(MenuCategory.display_order.asc(), MenuCategory.id.asc()).all()

@router.post("/categories", response_model=MenuCategoryResponse)
def create_category(
    req: MenuCategoryCreate,
    workspace=Depends(get_current_workspace),
    membership=Depends(require_role(["OWNER", "MANAGER"])),
    db: Session = Depends(get_db)
):
    cat = MenuCategory(
        workspace_id=workspace.id,
        name=req.name,
        description=req.description,
        display_order=req.display_order,
        is_active=True
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat

@router.put("/categories/{category_id}", response_model=MenuCategoryResponse)
def update_category(
    category_id: int,
    req: MenuCategoryUpdate,
    workspace=Depends(get_current_workspace),
    membership=Depends(require_role(["OWNER", "MANAGER"])),
    db: Session = Depends(get_db)
):
    cat = db.query(MenuCategory).filter(
        MenuCategory.id == category_id,
        MenuCategory.workspace_id == workspace.id
    ).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")

    for k, v in req.dict(exclude_unset=True).items():
        setattr(cat, k, v)
    db.commit()
    db.refresh(cat)
    return cat

@router.delete("/categories/{category_id}")
def delete_category(
    category_id: int,
    workspace=Depends(get_current_workspace),
    membership=Depends(require_role(["OWNER", "MANAGER"])),
    db: Session = Depends(get_db)
):
    cat = db.query(MenuCategory).filter(
        MenuCategory.id == category_id,
        MenuCategory.workspace_id == workspace.id
    ).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")

    db.delete(cat)
    db.commit()
    return {"status": "success", "message": "Category deleted"}

# ----------------- Menu Items -----------------

@router.get("/items", response_model=List[MenuItemResponse])
def get_menu_items(
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    workspace=Depends(get_current_workspace),
    db: Session = Depends(get_db)
):
    query = db.query(MenuItem).filter(MenuItem.workspace_id == workspace.id)
    if category_id:
        query = query.filter(MenuItem.category_id == category_id)
    if search:
        query = query.filter(MenuItem.name.ilike(f"%{search}%"))
    return query.order_by(MenuItem.id.asc()).all()

@router.post("/items", response_model=MenuItemResponse)
def create_menu_item(
    req: MenuItemCreate,
    workspace=Depends(get_current_workspace),
    membership=Depends(require_role(["OWNER", "MANAGER"])),
    db: Session = Depends(get_db)
):
    item = MenuItem(
        workspace_id=workspace.id,
        category_id=req.category_id,
        name=req.name,
        short_description=req.short_description,
        long_description=req.long_description,
        description_hi=req.description_hi,
        description_hinglish=req.description_hinglish,
        price=req.price,
        currency=req.currency or workspace.currency or "INR",
        ingredients=req.ingredients or [],
        allergens=req.allergens or [],
        dietary_badges=req.dietary_badges or [],
        spice_level=req.spice_level or "mild",
        image_url=req.image_url,
        is_available=req.is_available,
        is_published=req.is_published,
        preparation_time_minutes=req.preparation_time_minutes,
        calories=req.calories,
        is_chef_special=req.is_chef_special,
        search_keywords=req.search_keywords or []
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.put("/items/{item_id}", response_model=MenuItemResponse)
def update_menu_item(
    item_id: int,
    req: MenuItemUpdate,
    workspace=Depends(get_current_workspace),
    membership=Depends(require_role(["OWNER", "MANAGER"])),
    db: Session = Depends(get_db)
):
    item = db.query(MenuItem).filter(
        MenuItem.id == item_id,
        MenuItem.workspace_id == workspace.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    for k, v in req.dict(exclude_unset=True).items():
        setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item

@router.delete("/items/{item_id}")
def delete_menu_item(
    item_id: int,
    workspace=Depends(get_current_workspace),
    membership=Depends(require_role(["OWNER", "MANAGER"])),
    db: Session = Depends(get_db)
):
    item = db.query(MenuItem).filter(
        MenuItem.id == item_id,
        MenuItem.workspace_id == workspace.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    db.delete(item)
    db.commit()
    return {"status": "success", "message": "Menu item deleted"}

# ----------------- AI Description Generation -----------------

@router.post("/generate-description", response_model=DescriptionGenerateResponse)
async def generate_ai_description(
    req: DescriptionGenerateRequest,
    workspace=Depends(get_current_workspace),
    membership=Depends(require_role(["OWNER", "MANAGER"]))
):
    return await menu_desc_service.generate_descriptions(req)

# ----------------- PDF Upload & Parsing -----------------

@router.post("/upload-pdf", response_model=MenuExtractionPreviewResponse)
async def upload_menu_pdf(
    file: UploadFile = File(...),
    workspace=Depends(get_current_workspace),
    user=Depends(get_current_user),
    membership=Depends(require_role(["OWNER", "MANAGER"])),
    db: Session = Depends(get_db)
):
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(settings.UPLOAD_DIR, f"{workspace.id}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(file_path)
    doc_upload = DocumentUpload(
        workspace_id=workspace.id,
        file_name=file.filename or "uploaded_menu.pdf",
        file_path=file_path,
        file_type="pdf",
        file_size_bytes=file_size,
        uploaded_by_user_id=user.id
    )
    db.add(doc_upload)
    db.commit()
    db.refresh(doc_upload)

    # Extract text using PyMuPDF
    raw_text = menu_extraction_service.extract_text_from_pdf(file_path)
    candidates = menu_extraction_service.parse_menu_text_to_candidates(raw_text)

    extraction_job = DocumentExtractionJob(
        workspace_id=workspace.id,
        document_id=doc_upload.id,
        status="COMPLETED",
        extracted_text=raw_text[:2000],
        structured_preview_json=[c.dict() for c in candidates]
    )
    db.add(extraction_job)
    db.commit()
    db.refresh(extraction_job)

    return MenuExtractionPreviewResponse(
        job_id=extraction_job.id,
        document_id=doc_upload.id,
        status="COMPLETED",
        raw_text_sample=raw_text[:400] + ("..." if len(raw_text) > 400 else ""),
        extracted_dishes=candidates,
        total_found=len(candidates)
    )

@router.post("/approve-imported")
def approve_imported_items(
    req: MenuApproveImportRequest,
    workspace=Depends(get_current_workspace),
    membership=Depends(require_role(["OWNER", "MANAGER"])),
    db: Session = Depends(get_db)
):
    # Ensure categories exist or create them
    created_items_count = 0
    cat_map = {}

    for cand in req.items:
        cat_name = cand.category.strip()
        if cat_name not in cat_map:
            category = db.query(MenuCategory).filter(
                MenuCategory.workspace_id == workspace.id,
                MenuCategory.name.ilike(cat_name)
            ).first()
            if not category:
                category = MenuCategory(
                    workspace_id=workspace.id,
                    name=cat_name,
                    display_order=len(cat_map) + 1
                )
                db.add(category)
                db.commit()
                db.refresh(category)
            cat_map[cat_name] = category.id

        cat_id = cat_map[cat_name]

        # Create menu item
        new_item = MenuItem(
            workspace_id=workspace.id,
            category_id=cat_id,
            name=cand.name,
            price=cand.price,
            currency=workspace.currency or "INR",
            short_description=cand.description or f"Artisanal {cand.name}",
            long_description=f"Freshly prepared {cand.name} with premium ingredients.",
            dietary_badges=cand.dietary_badges,
            allergens=cand.allergens,
            is_available=True,
            is_published=True
        )
        db.add(new_item)
        created_items_count += 1

    db.commit()
    return {
        "status": "success",
        "created_items_count": created_items_count,
        "message": f"Successfully approved and published {created_items_count} menu items!"
    }
