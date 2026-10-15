import csv
import io
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.review import CustomerReview, ReviewReplyDraft
from app.schemas.review import (
    ReviewResponse, ReviewCreateRequest, SentimentIntelligenceSummary,
    ReviewReplyDraftResponse, ReviewReplyDraftCreateRequest, ReviewReplyApproveRequest
)
from app.services.ai.review_analysis_service import review_analysis_service
from app.services.ai.review_reply_service import review_reply_service
from app.api.deps import get_current_user, get_current_workspace, require_role

router = APIRouter(prefix="/reviews", tags=["Review Intelligence & Reply Studio"])

@router.get("", response_model=List[ReviewResponse])
def list_reviews(
    sentiment: Optional[str] = None,
    min_rating: Optional[int] = None,
    workspace=Depends(get_current_workspace),
    db: Session = Depends(get_db)
):
    query = db.query(CustomerReview).filter(CustomerReview.workspace_id == workspace.id)
    if sentiment:
        query = query.filter(CustomerReview.sentiment == sentiment.upper())
    if min_rating:
        query = query.filter(CustomerReview.rating >= min_rating)
    return query.order_by(CustomerReview.review_date.desc()).all()

@router.post("", response_model=ReviewResponse)
def create_manual_review(
    req: ReviewCreateRequest,
    workspace=Depends(get_current_workspace),
    membership=Depends(require_role(["OWNER", "MANAGER"])),
    db: Session = Depends(get_db)
):
    analysis = review_analysis_service.analyze_single_review(req.review_text, req.rating)
    review = CustomerReview(
        workspace_id=workspace.id,
        source=req.source,
        customer_name=req.customer_name or "Anonymous Diner",
        rating=req.rating,
        review_text=req.review_text,
        review_date=req.review_date or datetime.utcnow(),
        sentiment=analysis["sentiment"],
        sentiment_score=analysis["sentiment_score"],
        topics=analysis["topics"],
        recurring_complaint=analysis["recurring_complaint"],
        status="NEW"
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review

@router.post("/import-csv")
async def import_reviews_csv(
    file: UploadFile = File(...),
    workspace=Depends(get_current_workspace),
    membership=Depends(require_role(["OWNER", "MANAGER"])),
    db: Session = Depends(get_db)
):
    contents = await file.read()
    try:
        decoded = contents.decode("utf-8")
    except UnicodeDecodeError:
        decoded = contents.decode("latin-1")

    reader = csv.DictReader(io.StringIO(decoded))
    imported_count = 0
    errors = []

    for row_idx, row in enumerate(reader, start=1):
        # Flexible header detection
        text = row.get("review_text") or row.get("Review") or row.get("text") or row.get("comment") or ""
        rating_raw = row.get("rating") or row.get("Rating") or row.get("stars") or "5"
        customer = row.get("customer_name") or row.get("Customer") or row.get("author") or "Diner"
        
        if not text.strip():
            continue

        try:
            rating = int(float(rating_raw))
            rating = max(1, min(5, rating))
        except ValueError:
            rating = 4

        analysis = review_analysis_service.analyze_single_review(text, rating)
        rev = CustomerReview(
            workspace_id=workspace.id,
            source="CSV_IMPORT",
            customer_name=customer.strip(),
            rating=rating,
            review_text=text.strip(),
            review_date=datetime.utcnow(),
            sentiment=analysis["sentiment"],
            sentiment_score=analysis["sentiment_score"],
            topics=analysis["topics"],
            recurring_complaint=analysis["recurring_complaint"],
            status="NEW"
        )
        db.add(rev)
        imported_count += 1

    db.commit()
    return {
        "status": "success",
        "imported_count": imported_count,
        "message": f"Successfully parsed and ingested {imported_count} verified reviews."
    }

@router.get("/intelligence-summary", response_model=SentimentIntelligenceSummary)
def get_intelligence_summary(
    workspace=Depends(get_current_workspace),
    db: Session = Depends(get_db)
):
    return review_analysis_service.get_workspace_intelligence_summary(db, workspace.id)

# ----------------- AI Reply Studio -----------------

@router.post("/{review_id}/generate-reply", response_model=ReviewReplyDraftResponse)
async def generate_review_reply(
    review_id: int,
    req: ReviewReplyDraftCreateRequest,
    workspace=Depends(get_current_workspace),
    membership=Depends(require_role(["OWNER", "MANAGER"])),
    db: Session = Depends(get_db)
):
    review = db.query(CustomerReview).filter(
        CustomerReview.id == review_id,
        CustomerReview.workspace_id == workspace.id
    ).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    draft_text = await review_reply_service.generate_reply(
        review=review,
        tone=req.tone,
        language=req.language,
        restaurant_name=workspace.name
    )

    draft = ReviewReplyDraft(
        review_id=review.id,
        tone=req.tone.upper(),
        language=req.language.upper(),
        draft_text=draft_text,
        is_approved=False,
        is_copied_or_published=False
    )
    db.add(draft)
    db.commit()
    db.refresh(draft)
    return draft

@router.post("/drafts/{draft_id}/approve", response_model=ReviewReplyDraftResponse)
def approve_reply_draft(
    draft_id: int,
    req: ReviewReplyApproveRequest,
    workspace=Depends(get_current_workspace),
    user=Depends(get_current_user),
    membership=Depends(require_role(["OWNER", "MANAGER"])),
    db: Session = Depends(get_db)
):
    draft = db.query(ReviewReplyDraft).filter(ReviewReplyDraft.id == draft_id).first()
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")

    review = db.query(CustomerReview).filter(
        CustomerReview.id == draft.review_id,
        CustomerReview.workspace_id == workspace.id
    ).first()
    if not review:
        raise HTTPException(status_code=404, detail="Associated review does not belong to your workspace")

    if req.edited_text and req.edited_text.strip():
        draft.draft_text = req.edited_text.strip()

    draft.is_approved = True
    draft.approved_at = datetime.utcnow()
    draft.approved_by_user_id = user.id
    draft.is_copied_or_published = True

    review.status = "REPLIED"
    db.commit()
    db.refresh(draft)
    return draft
