import random
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.workspace import Workspace, RestaurantSettings
from app.models.menu import MenuCategory, MenuItem
from app.models.order import Order, OrderItem, OrderStatusHistory
from app.schemas.order import OrderCreateRequest, OrderResponse
from app.schemas.ai_chat import CustomerAIChatRequest, CustomerAIChatResponse
from app.services.ai.menu_rag_service import menu_rag_service

router = APIRouter(prefix="/public/menu", tags=["Public Digital QR Menu"])

@router.get("/{slug}")
def get_public_menu(slug: str, db: Session = Depends(get_db)):
    workspace = db.query(Workspace).filter(Workspace.slug == slug, Workspace.is_active == True).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Restaurant menu not found or unpublished")

    settings = db.query(RestaurantSettings).filter(RestaurantSettings.workspace_id == workspace.id).first()

    categories = db.query(MenuCategory).filter(
        MenuCategory.workspace_id == workspace.id,
        MenuCategory.is_active == True
    ).order_by(MenuCategory.display_order.asc(), MenuCategory.id.asc()).all()

    items = db.query(MenuItem).filter(
        MenuItem.workspace_id == workspace.id,
        MenuItem.is_published == True
    ).all()

    category_items_map = {}
    for item in items:
        category_items_map.setdefault(item.category_id, []).append({
            "id": item.id,
            "name": item.name,
            "short_description": item.short_description,
            "long_description": item.long_description,
            "description_hi": item.description_hi,
            "description_hinglish": item.description_hinglish,
            "price": item.price,
            "currency": item.currency or workspace.currency or "INR",
            "ingredients": item.ingredients or [],
            "allergens": item.allergens or [],
            "dietary_badges": item.dietary_badges or [],
            "spice_level": item.spice_level or "mild",
            "image_url": item.image_url,
            "is_available": item.is_available,
            "is_chef_special": item.is_chef_special,
            "preparation_time_minutes": item.preparation_time_minutes,
            "calories": item.calories
        })

    structured_categories = []
    for cat in categories:
        cat_items = category_items_map.get(cat.id, [])
        if cat_items:
            structured_categories.append({
                "id": cat.id,
                "name": cat.name,
                "description": cat.description,
                "items": cat_items
            })

    return {
        "restaurant": {
            "name": workspace.name,
            "slug": workspace.slug,
            "type": workspace.restaurant_type,
            "description": workspace.description,
            "address": workspace.address,
            "city": workspace.city,
            "phone": workspace.phone,
            "currency": workspace.currency,
            "logo_url": workspace.logo_url,
            "opening_hours": settings.opening_hours if settings else None,
            "ordering_enabled": settings.ordering_enabled if settings else True,
            "table_ordering_enabled": settings.table_ordering_enabled if settings else True,
            "takeaway_enabled": settings.takeaway_enabled if settings else True,
            "tax_rate_percent": settings.tax_rate_percent if settings else 5.0,
            "demo_mode": settings.demo_mode if settings else False
        },
        "categories": structured_categories
    }

@router.post("/{slug}/ai-assistant", response_model=CustomerAIChatResponse)
async def ask_menu_assistant(slug: str, req: CustomerAIChatRequest, db: Session = Depends(get_db)):
    workspace = db.query(Workspace).filter(Workspace.slug == slug, Workspace.is_active == True).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Restaurant menu not found")

    return await menu_rag_service.answer_customer_query(db, workspace.id, req)

@router.post("/{slug}/order", response_model=OrderResponse)
def place_customer_order(slug: str, req: OrderCreateRequest, db: Session = Depends(get_db)):
    workspace = db.query(Workspace).filter(Workspace.slug == slug, Workspace.is_active == True).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    settings = db.query(RestaurantSettings).filter(RestaurantSettings.workspace_id == workspace.id).first()
    if settings and not settings.ordering_enabled:
        raise HTTPException(status_code=400, detail="Online ordering is currently suspended by the restaurant")

    if not req.items:
        raise HTTPException(status_code=400, detail="Cannot place an empty order")

    # Generate sequential unique order number
    rand_suffix = random.randint(1000, 9999)
    order_number = f"ORD-{rand_suffix}"

    # Calculate totals securely on the backend using trusted menu items
    subtotal = 0.0
    order_items_to_create = []

    for item_req in req.items:
        menu_item = db.query(MenuItem).filter(
            MenuItem.id == item_req.menu_item_id,
            MenuItem.workspace_id == workspace.id,
            MenuItem.is_published == True
        ).first()

        if not menu_item:
            raise HTTPException(status_code=400, detail=f"Item with ID {item_req.menu_item_id} is invalid or not available")

        if not menu_item.is_available:
            raise HTTPException(status_code=400, detail=f"Dish '{menu_item.name}' is currently marked sold out")

        qty = max(1, item_req.quantity)
        line_total = round(menu_item.price * qty, 2)
        subtotal += line_total

        order_items_to_create.append(OrderItem(
            menu_item_id=menu_item.id,
            item_name=menu_item.name,
            unit_price=menu_item.price,
            quantity=qty,
            item_total=line_total,
            notes=item_req.notes
        ))

    tax_rate = (settings.tax_rate_percent if settings else 5.0) / 100.0
    tax_amount = round(subtotal * tax_rate, 2)
    service_charge = round(subtotal * ((settings.service_charge_percent if settings else 0.0) / 100.0), 2)
    total_amount = round(subtotal + tax_amount + service_charge, 2)

    new_order = Order(
        workspace_id=workspace.id,
        order_number=order_number,
        customer_name=req.customer_name or "Guest",
        customer_phone=req.customer_phone,
        order_type=req.order_type,
        table_number=req.table_number,
        status="PENDING",
        subtotal=subtotal,
        tax_amount=tax_amount,
        service_charge=service_charge,
        total_amount=total_amount,
        currency=workspace.currency or "INR",
        notes=req.notes,
        is_paid=False,
        payment_method="PAY_AT_COUNTER"
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    # Attach items and history
    for oi in order_items_to_create:
        oi.order_id = new_order.id
        db.add(oi)

    history = OrderStatusHistory(
        order_id=new_order.id,
        status="PENDING",
        changed_by="CUSTOMER",
        notes="Order placed via digital QR menu"
    )
    db.add(history)
    db.commit()
    db.refresh(new_order)

    return new_order

@router.get("/{slug}/order-status/{order_number}", response_model=OrderResponse)
def get_order_status(slug: str, order_number: str, db: Session = Depends(get_db)):
    workspace = db.query(Workspace).filter(Workspace.slug == slug).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    order = db.query(Order).filter(
        Order.workspace_id == workspace.id,
        Order.order_number == order_number
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return order
