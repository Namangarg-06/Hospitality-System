from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.action import ActionInsight
from app.models.menu import MenuItem
from app.models.order import Order
from app.models.review import CustomerReview
from app.models.inventory import FoodWasteRecord

class ActionEngine:
    """Central Intelligence Engine synthesizing real-time operational alerts across all modules."""

    @classmethod
    def evaluate_workspace(cls, db: Session, workspace_id: int) -> List[ActionInsight]:
        """Evaluates operational data and creates or updates action insights."""
        existing_insights = db.query(ActionInsight).filter(
            ActionInsight.workspace_id == workspace_id,
            ActionInsight.status == "OPEN"
        ).all()
        existing_titles = {i.title for i in existing_insights}

        new_insights: List[ActionInsight] = []

        # 1. Check for Pending Orders needing immediate attention
        cutoff_pending = datetime.utcnow() - timedelta(minutes=10)
        pending_orders = db.query(Order).filter(
            Order.workspace_id == workspace_id,
            Order.status == "PENDING"
        ).all()

        if pending_orders:
            title = f"{len(pending_orders)} Live Order(s) Awaiting Kitchen Confirmation"
            if title not in existing_titles:
                new_insights.append(ActionInsight(
                    workspace_id=workspace_id,
                    title=title,
                    category="ORDERS",
                    severity="CRITICAL" if len(pending_orders) > 2 else "WARNING",
                    explanation=f"There are currently {len(pending_orders)} incoming digital orders awaiting acceptance by dining staff.",
                    supporting_evidence=[f"Order #{o.order_number} ({o.order_type}) - ₹{o.total_amount}" for o in pending_orders[:3]],
                    source_records=[{"entity": "order", "id": o.id} for o in pending_orders[:3]],
                    recommended_next_step="Open Order Management screen and accept or dispatch these orders immediately.",
                    status="OPEN",
                    confidence_score=1.0
                ))

        # 2. Check for Recurring Slow Service Complaints
        slow_reviews = db.query(CustomerReview).filter(
            CustomerReview.workspace_id == workspace_id,
            CustomerReview.rating <= 3
        ).all()
        slow_evidence = [r.review_text for r in slow_reviews if "slow" in r.review_text.lower() or "wait" in r.review_text.lower()]
        
        if len(slow_evidence) >= 2:
            title = "Recurring Customer Complaints on Service Speed During Peak Hours"
            if title not in existing_titles:
                new_insights.append(ActionInsight(
                    workspace_id=workspace_id,
                    title=title,
                    category="SERVICE",
                    severity="CRITICAL",
                    explanation="Multiple guests have reported unacceptable wait times and delayed table service in recent reviews.",
                    supporting_evidence=slow_evidence[:3],
                    source_records=[{"entity": "review", "count": len(slow_evidence)}],
                    recommended_next_step="Deploy additional floor captain during weekend rush and review kitchen ticket dispatch velocity.",
                    status="OPEN",
                    confidence_score=0.95
                ))

        # 3. Check for Repeated Food Waste on Specific Dishes
        waste_records = db.query(FoodWasteRecord).filter(
            FoodWasteRecord.workspace_id == workspace_id
        ).all()
        waste_item_counts: Dict[str, float] = {}
        for w in waste_records:
            waste_item_counts[w.item_name] = waste_item_counts.get(w.item_name, 0.0) + w.quantity

        high_waste_items = [(k, v) for k, v in waste_item_counts.items() if v >= 3.0]
        if high_waste_items:
            item_name, total_kg = high_waste_items[0]
            title = f"High Food Wastage Pattern Detected: {item_name}"
            if title not in existing_titles:
                new_insights.append(ActionInsight(
                    workspace_id=workspace_id,
                    title=title,
                    category="WASTE",
                    severity="WARNING",
                    explanation=f"Over {round(total_kg, 1)}kg of {item_name} was logged as waste due to over-preparation and expiration.",
                    supporting_evidence=[f"Recorded total: {round(total_kg, 1)}kg across recent production cycles."],
                    source_records=[{"entity": "waste_record", "item_name": item_name}],
                    recommended_next_step=f"Adjust kitchen morning batch prep size for {item_name} down by 20% to prevent spoilage.",
                    status="OPEN",
                    confidence_score=0.92
                ))

        # 4. Check for Unreplied Negative Reviews
        unreplied_negative = db.query(CustomerReview).filter(
            CustomerReview.workspace_id == workspace_id,
            CustomerReview.rating <= 2,
            CustomerReview.status != "REPLIED"
        ).all()

        if unreplied_negative:
            title = f"{len(unreplied_negative)} Critical Guest Review(s) Without Approved Replies"
            if title not in existing_titles:
                new_insights.append(ActionInsight(
                    workspace_id=workspace_id,
                    title=title,
                    category="REVIEWS",
                    severity="WARNING",
                    explanation=f"Guests who experienced service lapses have not yet received an official response from hospitality management.",
                    supporting_evidence=[f"Rating: {r.rating}★ by {r.customer_name}: '{r.review_text[:60]}...'" for r in unreplied_negative[:2]],
                    source_records=[{"entity": "review", "id": r.id} for r in unreplied_negative[:2]],
                    recommended_next_step="Use AI Review Reply Studio to generate and approve a courteous, non-compensatory response.",
                    status="OPEN",
                    confidence_score=0.98
                ))

        # 5. Check for Menu Items Missing Allergen Declarations
        items_missing_allergens = db.query(MenuItem).filter(
            MenuItem.workspace_id == workspace_id,
            MenuItem.is_published == True
        ).all()
        unverified_items = [i.name for i in items_missing_allergens if not i.allergens and not i.dietary_badges]
        if unverified_items:
            title = f"Dietary & Allergen Verification Incomplete for {len(unverified_items)} Active Dishes"
            if title not in existing_titles:
                new_insights.append(ActionInsight(
                    workspace_id=workspace_id,
                    title=title,
                    category="MENU",
                    severity="OPTIMIZATION",
                    explanation=f"Active dishes like {', '.join(unverified_items[:2])} lack allergen tags, limiting AI menu assistant capabilities for guests with food sensitivities.",
                    supporting_evidence=[f"Dishes needing verification: {', '.join(unverified_items[:4])}"],
                    source_records=[{"entity": "menu_item", "names": unverified_items[:4]}],
                    recommended_next_step="Review Menu Studio and mark allergen flags (Dairy, Gluten, Nuts, etc.) to ensure guest dining safety.",
                    status="OPEN",
                    confidence_score=0.99
                ))

        # Persist new insights
        for insight in new_insights:
            db.add(insight)
        if new_insights:
            db.commit()

        # Return all active open insights
        return db.query(ActionInsight).filter(
            ActionInsight.workspace_id == workspace_id,
            ActionInsight.status == "OPEN"
        ).order_by(ActionInsight.created_at.desc()).all()

action_engine = ActionEngine()
