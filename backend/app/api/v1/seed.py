from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.seed_data import seed_demo_data

router = APIRouter(prefix="/seed", tags=["Seed & Demo"])

@router.post("/reset")
def reset_seed_data(db: Session = Depends(get_db)):
    ws = seed_demo_data(db)
    return {
        "status": "success",
        "workspace_name": ws.name,
        "workspace_slug": ws.slug,
        "message": "Demo data successfully seeded for The Royal Saffron!"
    }
