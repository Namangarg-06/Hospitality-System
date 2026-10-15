from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.action import ActionInsight
from app.schemas.action import ActionInsightResponse, ActionInsightStatusUpdate
from app.services.ai.action_engine import action_engine
from app.api.deps import get_current_user, get_current_workspace, require_role

router = APIRouter(prefix="/actions", tags=["AI Restaurant Action Engine"])

@router.get("", response_model=List[ActionInsightResponse])
def get_action_insights(
    workspace=Depends(get_current_workspace),
    db: Session = Depends(get_db)
):
    # Run evaluation to catch any newly triggered alerts
    action_engine.evaluate_workspace(db, workspace.id)
    return db.query(ActionInsight).filter(
        ActionInsight.workspace_id == workspace.id
    ).order_by(ActionInsight.created_at.desc()).all()

@router.patch("/{action_id}", response_model=ActionInsightResponse)
def update_action_insight(
    action_id: int,
    req: ActionInsightStatusUpdate,
    workspace=Depends(get_current_workspace),
    user=Depends(get_current_user),
    membership=Depends(require_role(["OWNER", "MANAGER"])),
    db: Session = Depends(get_db)
):
    insight = db.query(ActionInsight).filter(
        ActionInsight.id == action_id,
        ActionInsight.workspace_id == workspace.id
    ).first()
    if not insight:
        raise HTTPException(status_code=404, detail="Action insight not found")

    target_status = req.status.upper()
    if target_status not in ["OPEN", "IN_PROGRESS", "RESOLVED", "DISMISSED"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    insight.status = target_status
    if req.assigned_to_user_id is not None:
        insight.assigned_to_user_id = req.assigned_to_user_id

    db.commit()
    db.refresh(insight)
    return insight

@router.post("/refresh", response_model=List[ActionInsightResponse])
def refresh_action_engine(
    workspace=Depends(get_current_workspace),
    membership=Depends(require_role(["OWNER", "MANAGER"])),
    db: Session = Depends(get_db)
):
    return action_engine.evaluate_workspace(db, workspace.id)
