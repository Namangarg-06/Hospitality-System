import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.db.session import engine, Base, SessionLocal
from app.services.seed_data import seed_demo_data

# Import all routers
from app.api.v1.auth import router as auth_router
from app.api.v1.workspaces import router as workspaces_router
from app.api.v1.menus import router as menus_router
from app.api.v1.public_menu import router as public_menu_router
from app.api.v1.orders import router as orders_router
from app.api.v1.reviews import router as reviews_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.waste import router as waste_router
from app.api.v1.actions import router as actions_router
from app.api.v1.seed import router as seed_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database schema is initialized
    Base.metadata.create_all(bind=engine)
    
    # Auto-migrate new Smart QR columns for SQLite if not present
    from sqlalchemy import text
    with engine.connect() as conn:
        for col, col_type in [
            ("whatsapp_number", "VARCHAR(50)"),
            ("google_review_url", "VARCHAR(500)"),
            ("instagram_url", "VARCHAR(500)"),
            ("website_url", "VARCHAR(500)"),
            ("upi_id", "VARCHAR(100)"),
            ("wifi_name", "VARCHAR(100)"),
            ("wifi_password", "VARCHAR(100)"),
            ("pdf_menu_url", "VARCHAR(500)"),
            ("pdf_menu_filename", "VARCHAR(255)"),
            ("custom_links", "JSON"),
        ]:
            try:
                conn.execute(text(f"ALTER TABLE workspaces ADD COLUMN {col} {col_type}"))
                conn.commit()
            except Exception:
                pass

    # Ensure demo dataset exists
    db = SessionLocal()
    try:
        seed_demo_data(db)
    finally:
        db.close()
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Smarter Dining. Smarter Operations. Luxury Restaurant Growth & Operations SaaS Platform.",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API v1 Router Registration
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(workspaces_router, prefix=settings.API_V1_STR)
app.include_router(menus_router, prefix=settings.API_V1_STR)
app.include_router(public_menu_router, prefix=settings.API_V1_STR)
app.include_router(orders_router, prefix=settings.API_V1_STR)
app.include_router(reviews_router, prefix=settings.API_V1_STR)
app.include_router(analytics_router, prefix=settings.API_V1_STR)
app.include_router(waste_router, prefix=settings.API_V1_STR)
app.include_router(actions_router, prefix=settings.API_V1_STR)
app.include_router(seed_router, prefix=settings.API_V1_STR)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "mode": "production-ready"
    }

# Mount uploads directory (ensure it and subdirectories exist)
menus_dir = os.path.join(settings.UPLOAD_DIR, "menus")
os.makedirs(menus_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Detect and mount frontend production build (SPA)
from pathlib import Path
from fastapi.responses import FileResponse
from fastapi import HTTPException

frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if not frontend_dist.exists():
    frontend_dist = Path(__file__).resolve().parent.parent / "frontend" / "dist"

if frontend_dist.exists():
    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}", tags=["Frontend"])
    async def serve_frontend(full_path: str):
        # Do not intercept API, docs, redoc, health, or openapi.json
        if (
            full_path.startswith("api/")
            or full_path.startswith("docs")
            or full_path.startswith("redoc")
            or full_path.startswith("openapi.json")
            or full_path.startswith("health")
        ):
            raise HTTPException(status_code=404, detail="Endpoint not found")
        
        file_path = frontend_dist / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_dist / "index.html")
else:
    @app.get("/", tags=["Root"])
    def root():
        return {
            "application": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "docs_url": "/docs",
            "health_url": "/health",
        }
