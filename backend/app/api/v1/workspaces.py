from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import hash_password
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMembership, RestaurantSettings
from app.schemas.workspace import (
    WorkspaceResponse, WorkspaceUpdate, RestaurantSettingsResponse,
    RestaurantSettingsUpdate, MemberInviteRequest, MemberResponse
)
from app.api.deps import get_current_user, get_current_workspace, require_role

router = APIRouter(prefix="/workspaces", tags=["Workspaces"])

@router.get("/current", response_model=WorkspaceResponse)
def get_current_workspace_details(
    workspace: Workspace = Depends(get_current_workspace),
    db: Session = Depends(get_db)
):
    settings = db.query(RestaurantSettings).filter(RestaurantSettings.workspace_id == workspace.id).first()
    res = WorkspaceResponse.model_validate(workspace)
    if settings:
        res.settings = RestaurantSettingsResponse.model_validate(settings)
    return res

@router.put("/current", response_model=WorkspaceResponse)
def update_current_workspace(
    req: WorkspaceUpdate,
    workspace: Workspace = Depends(get_current_workspace),
    membership=Depends(require_role(["OWNER", "MANAGER"])),
    db: Session = Depends(get_db)
):
    for field, val in req.dict(exclude_unset=True).items():
        setattr(workspace, field, val)
    db.commit()
    db.refresh(workspace)
    
    settings = db.query(RestaurantSettings).filter(RestaurantSettings.workspace_id == workspace.id).first()
    res = WorkspaceResponse.model_validate(workspace)
    if settings:
        res.settings = RestaurantSettingsResponse.model_validate(settings)
    return res

@router.put("/current/settings", response_model=RestaurantSettingsResponse)
def update_workspace_settings(
    req: RestaurantSettingsUpdate,
    workspace: Workspace = Depends(get_current_workspace),
    membership=Depends(require_role(["OWNER", "MANAGER"])),
    db: Session = Depends(get_db)
):
    settings = db.query(RestaurantSettings).filter(RestaurantSettings.workspace_id == workspace.id).first()
    if not settings:
        settings = RestaurantSettings(workspace_id=workspace.id)
        db.add(settings)

    for field, val in req.dict(exclude_unset=True).items():
        setattr(settings, field, val)
    db.commit()
    db.refresh(settings)
    return RestaurantSettingsResponse.model_validate(settings)

@router.get("/current/members", response_model=List[MemberResponse])
def list_workspace_members(
    workspace: Workspace = Depends(get_current_workspace),
    membership=Depends(require_role(["OWNER", "MANAGER"])),
    db: Session = Depends(get_db)
):
    memberships = db.query(WorkspaceMembership).filter(WorkspaceMembership.workspace_id == workspace.id).all()
    results = []
    for m in memberships:
        u = db.query(User).filter(User.id == m.user_id).first()
        if u:
            results.append(MemberResponse(
                membership_id=m.id,
                user_id=u.id,
                email=u.email,
                full_name=u.full_name,
                role=m.role,
                created_at=m.created_at
            ))
    return results

@router.post("/current/members", response_model=MemberResponse)
def invite_workspace_member(
    req: MemberInviteRequest,
    workspace: Workspace = Depends(get_current_workspace),
    membership=Depends(require_role(["OWNER"])),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user:
        user = User(
            email=req.email.lower(),
            hashed_password=hash_password(req.temporary_password or "DineAI@2026"),
            full_name=req.full_name,
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    existing_membership = db.query(WorkspaceMembership).filter(
        WorkspaceMembership.user_id == user.id,
        WorkspaceMembership.workspace_id == workspace.id
    ).first()
    if existing_membership:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User is already a member of this restaurant workspace")

    role_to_assign = req.role.upper() if req.role.upper() in ["MANAGER", "STAFF"] else "STAFF"
    new_mem = WorkspaceMembership(
        user_id=user.id,
        workspace_id=workspace.id,
        role=role_to_assign
    )
    db.add(new_mem)
    db.commit()
    db.refresh(new_mem)

    return MemberResponse(
        membership_id=new_mem.id,
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=new_mem.role,
        created_at=new_mem.created_at
    )
