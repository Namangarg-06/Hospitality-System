from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.inventory import FoodWasteRecord
from app.schemas.inventory import (
    FoodWasteRecordCreate, FoodWasteRecordResponse, WasteSummaryResponse
)
from app.api.deps import get_current_user, get_current_workspace

router = APIRouter(prefix="/waste", tags=["Inventory & Food-Waste Intelligence"])

@router.get("", response_model=List[FoodWasteRecordResponse])
def list_waste_records(
    workspace=Depends(get_current_workspace),
    db: Session = Depends(get_db)
):
    return db.query(FoodWasteRecord).filter(
        FoodWasteRecord.workspace_id == workspace.id
    ).order_by(FoodWasteRecord.date_time.desc()).all()

@router.post("", response_model=FoodWasteRecordResponse)
def record_food_waste(
    req: FoodWasteRecordCreate,
    workspace=Depends(get_current_workspace),
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = FoodWasteRecord(
        workspace_id=workspace.id,
        item_name=req.item_name,
        is_dish=req.is_dish,
        quantity=req.quantity,
        unit=req.unit,
        date_time=req.date_time or datetime.utcnow(),
        reason=req.reason,
        estimated_cost=req.estimated_cost,
        currency=workspace.currency or "INR",
        notes=req.notes,
        recorded_by_user_id=user.id
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

@router.get("/summary", response_model=WasteSummaryResponse)
def get_waste_summary(
    workspace=Depends(get_current_workspace),
    db: Session = Depends(get_db)
):
    records = db.query(FoodWasteRecord).filter(
        FoodWasteRecord.workspace_id == workspace.id
    ).all()

    total_cost = round(sum(r.estimated_cost for r in records), 2)
    total_qty = round(sum(r.quantity for r in records), 2)

    # Breakdown by reason
    reasons_map = {}
    items_map = {}
    for r in records:
        reasons_map[r.reason] = reasons_map.get(r.reason, 0.0) + r.estimated_cost
        items_map[r.item_name] = items_map.get(r.item_name, 0.0) + r.quantity

    reason_breakdown = [
        {
            "reason": k.replace("_", " ").title(),
            "cost": round(v, 2),
            "percentage": round((v / total_cost) * 100, 1) if total_cost > 0 else 0
        }
        for k, v in reasons_map.items()
    ]

    top_wasted = [
        {"item_name": k, "quantity": round(v, 2), "unit": "kg"}
        for k, v in sorted(items_map.items(), key=lambda x: x[1], reverse=True)[:5]
    ]

    trend_by_date = [
        {
            "date": r.date_time.strftime("%d %b"),
            "cost": r.estimated_cost,
            "quantity": r.quantity,
            "item": r.item_name
        }
        for r in records[-7:]
    ]

    recommendations = [
        "Implement morning demand batch-sizing for gravies and curries to curb over-preparation.",
        "Calibrate walk-in refrigeration temperature monitors to avoid dairy and cottage cheese spoilage.",
        "Audit side portion yields on signature breads to reduce plate waste."
    ]

    return WasteSummaryResponse(
        total_waste_records=len(records),
        total_waste_cost=total_cost,
        total_waste_quantity_kg=total_qty,
        currency=workspace.currency or "INR",
        reason_breakdown=reason_breakdown,
        top_wasted_items=top_wasted,
        trend_by_date=trend_by_date,
        actionable_reduction_recommendations=recommendations
    )
