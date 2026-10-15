import re
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User
from app.models.workspace import Workspace, WorkspaceMembership, RestaurantSettings
from app.schemas.auth import LoginRequest, RegisterRequest, Token, UserResponse, WorkspaceBasic
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    return re.sub(r"[\s_-]+", "-", text)

@router.post("/register", response_model=Token)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email.lower()).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already registered")

    user = User(
        email=req.email.lower(),
        hashed_password=hash_password(req.password),
        full_name=req.full_name,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Automatically create workspace for the new user
    r_name = req.restaurant_name or f"{req.full_name}'s Restaurant"
    base_slug = slugify(r_name)
    slug = base_slug
    counter = 1
    while db.query(Workspace).filter(Workspace.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    workspace = Workspace(
        name=r_name,
        slug=slug,
        restaurant_type=req.restaurant_type or "Fine Dining",
        currency="INR",
        timezone="Asia/Kolkata",
        is_active=True
    )
    db.add(workspace)
    db.commit()
    db.refresh(workspace)

    # Make user OWNER
    membership = WorkspaceMembership(
        user_id=user.id,
        workspace_id=workspace.id,
        role="OWNER"
    )
    db.add(membership)

    # Default settings
    settings = RestaurantSettings(
        workspace_id=workspace.id,
        menu_categories_list=["Starters", "Main Course", "Breads", "Desserts", "Beverages"],
        supported_languages=["en", "hi"],
        ordering_enabled=True,
        table_ordering_enabled=True,
        takeaway_enabled=True,
        tax_rate_percent=5.0
    )
    db.add(settings)
    db.commit()

    token = create_access_token({"sub": str(user.id), "workspace_id": workspace.id, "role": "OWNER"})
    return Token(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
        workspace=WorkspaceBasic(
            id=workspace.id,
            name=workspace.name,
            slug=workspace.slug,
            restaurant_type=workspace.restaurant_type,
            role="OWNER",
            currency=workspace.currency
        )
    )

@router.post("/login", response_model=Token)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")

    # Find primary workspace
    membership = db.query(WorkspaceMembership).filter(WorkspaceMembership.user_id == user.id).first()
    workspace_basic = None
    workspace_id = None
    role = "STAFF"

    if membership:
        ws = db.query(Workspace).filter(Workspace.id == membership.workspace_id).first()
        if ws:
            workspace_id = ws.id
            role = membership.role
            workspace_basic = WorkspaceBasic(
                id=ws.id,
                name=ws.name,
                slug=ws.slug,
                restaurant_type=ws.restaurant_type,
                role=role,
                currency=ws.currency
            )

    token = create_access_token({"sub": str(user.id), "workspace_id": workspace_id, "role": role})
    return Token(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
        workspace=workspace_basic
    )

@router.get("/me")
def get_me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    memberships = db.query(WorkspaceMembership).filter(WorkspaceMembership.user_id == user.id).all()
    workspaces_data = []
    for m in memberships:
        ws = db.query(Workspace).filter(Workspace.id == m.workspace_id).first()
        if ws:
            workspaces_data.append({
                "workspace_id": ws.id,
                "name": ws.name,
                "slug": ws.slug,
                "role": m.role,
                "restaurant_type": ws.restaurant_type
            })

    return {
        "user": UserResponse.model_validate(user),
        "workspaces": workspaces_data
    }
