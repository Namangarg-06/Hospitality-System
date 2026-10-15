from typing import List, Optional
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.order import Order, OrderItem, OrderStatusHistory
from app.schemas.order import OrderResponse, OrderStatusUpdateRequest
from app.api.deps import get_current_user, get_current_workspace

router = APIRouter(prefix="/orders", tags=["Order Management"])

VALID_TRANSITIONS = {
    "PENDING": ["ACCEPTED", "CANCELLED"],
    "ACCEPTED": ["PREPARING", "CANCELLED"],
    "PREPARING": ["READY", "CANCELLED"],
    "READY": ["COMPLETED", "CANCELLED"],
    "COMPLETED": [],
    "CANCELLED": []
}

@router.get("", response_model=List[OrderResponse])
def list_orders(
    status_filter: Optional[str] = None,
    workspace=Depends(get_current_workspace),
    db: Session = Depends(get_db)
):
    query = db.query(Order).filter(Order.workspace_id == workspace.id)
    if status_filter:
        query = query.filter(Order.status == status_filter.upper())
    return query.order_by(Order.created_at.desc()).all()

@router.get("/{order_id}", response_model=OrderResponse)
def get_order_detail(
    order_id: int,
    workspace=Depends(get_current_workspace),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.workspace_id == workspace.id
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.patch("/{order_id}/status", response_model=OrderResponse)
def update_order_status(
    order_id: int,
    req: OrderStatusUpdateRequest,
    workspace=Depends(get_current_workspace),
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.workspace_id == workspace.id
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    target_status = req.status.upper()
    if target_status not in ["PENDING", "ACCEPTED", "PREPARING", "READY", "COMPLETED", "CANCELLED"]:
        raise HTTPException(status_code=400, detail="Invalid order status")

    # Update status
    order.status = target_status
    if target_status == "COMPLETED":
        order.is_paid = True

    history = OrderStatusHistory(
        order_id=order.id,
        status=target_status,
        changed_by=f"STAFF ({user.full_name})",
        notes=req.notes or f"Status updated to {target_status}"
    )
    db.add(history)
    db.commit()
    db.refresh(order)
    return order
