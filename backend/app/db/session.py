from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings

# Handle SQLite vs PostgreSQL engine arguments
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def ensure_schema_columns():
    """Ensure smart QR columns exist in SQLite database if created prior."""
    if settings.DATABASE_URL.startswith("sqlite"):
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

try:
    ensure_schema_columns()
except Exception:
    pass

def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency for database session lifecycle."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

