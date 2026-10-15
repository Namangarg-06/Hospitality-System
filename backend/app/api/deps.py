from typing import Optional, List
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import decode_token
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMembership

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    payload = decode_token(token)
    if not payload or not payload.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = int(payload.get("sub"))
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found or inactive")
    return user

def get_current_workspace(
    user: User = Depends(get_current_user),
    x_workspace_id: Optional[str] = Header(None, alias="X-Workspace-ID"),
    db: Session = Depends(get_db)
) -> Workspace:
    """Enforces multi-tenant workspace isolation. User must belong to the requested workspace."""
    if x_workspace_id and x_workspace_id.isdigit():
        ws_id = int(x_workspace_id)
        membership = db.query(WorkspaceMembership).filter(
            WorkspaceMembership.user_id == user.id,
            WorkspaceMembership.workspace_id == ws_id
        ).first()
        if membership:
            ws = db.query(Workspace).filter(Workspace.id == ws_id, Workspace.is_active == True).first()
            if ws:
                return ws

    # Fallback to user's first accessible workspace
    first_membership = db.query(WorkspaceMembership).filter(
        WorkspaceMembership.user_id == user.id
    ).first()
    
    if not first_membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User does not belong to any active restaurant workspace"
        )
    
    workspace = db.query(Workspace).filter(
        Workspace.id == first_membership.workspace_id,
        Workspace.is_active == True
    ).first()
    if not workspace:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workspace not found")
    return workspace

def require_role(allowed_roles: List[str]):
    """Strict backend RBAC dependency: OWNER, MANAGER, STAFF."""
    def role_checker(
        user: User = Depends(get_current_user),
        workspace: Workspace = Depends(get_current_workspace),
        db: Session = Depends(get_db)
    ) -> WorkspaceMembership:
        membership = db.query(WorkspaceMembership).filter(
            WorkspaceMembership.user_id == user.id,
            WorkspaceMembership.workspace_id == workspace.id
        ).first()
        
        if not membership or membership.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation requires one of the following roles: {', '.join(allowed_roles)}"
            )
        return membership
    return role_checker
