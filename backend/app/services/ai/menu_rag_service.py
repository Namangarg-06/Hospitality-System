import re
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.menu import MenuItem, MenuCategory
from app.schemas.ai_chat import CustomerAIChatRequest, CustomerAIChatResponse, DishRecommendationCitation
from app.services.ai.llm_provider import llm_client

class MenuRAGService:
    """Grounds customer conversation strictly in published, available restaurant menu items."""

    @classmethod
    async def answer_customer_query(cls, db: Session, workspace_id: int, req: CustomerAIChatRequest) -> CustomerAIChatResponse:
        # 1. Fetch all published and available items from DB for this workspace
        items = db.query(MenuItem).filter(
            MenuItem.workspace_id == workspace_id,
            MenuItem.is_published == True,
            MenuItem.is_available == True
        ).all()

        query_lower = req.message.lower()

        # Deterministic extraction of constraints:
        # Max budget filter: e.g. "under 400", "below 300", "< 500", "less than 350"
        budget_match = re.search(r"(?:under|below|less than|<|budget of)\s*(?:₹|inr|rs\.?)?\s*(\d{2,4})", query_lower)
        max_budget = float(budget_match.group(1)) if budget_match else None

        # Dietary preference
        is_veg_query = any(w in query_lower for w in ["veg", "vegetarian", "shakahari"]) and not any(w in query_lower for w in ["non-veg", "nonveg", "chicken", "mutton", "fish"])
        is_vegan_query = "vegan" in query_lower
        is_jain_query = "jain" in query_lower

        # Specific ingredient / allergen query: e.g. "without nuts", "nut free", "dairy free"
        allergen_avoid = None
        if "nut" in query_lower:
            allergen_avoid = "nuts"
        elif "dairy" in query_lower or "milk" in query_lower or "cheese" in query_lower:
            allergen_avoid = "dairy"
        elif "gluten" in query_lower:
            allergen_avoid = "gluten"

        # Filter items deterministically
        filtered_items = []
        for item in items:
            # Budget check
            if max_budget and item.price > max_budget:
                continue

            # Dietary check
            dietary = [d.lower() for d in (item.dietary_badges or [])]
            if is_vegan_query and "vegan" not in dietary:
                continue
            if is_jain_query and "jain" not in dietary:
                continue
            if is_veg_query and "veg" not in dietary and "vegan" not in dietary:
                continue

            # Allergen avoidance
            if allergen_avoid and allergen_avoid in [a.lower() for a in (item.allergens or [])]:
                continue

            filtered_items.append(item)

        # If user is asking for specific dish name
        matched_by_name = [i for i in items if i.name.lower() in query_lower]
        if matched_by_name:
            filtered_items = matched_by_name

        # If no items match constraints
        if not filtered_items:
            # Check if this was a budget or allergen restriction
            if max_budget:
                reply = f"We could not find any available items under ₹{int(max_budget)} matching your criteria. Our dishes start from ₹{int(min([i.price for i in items])) if items else 200}. Would you like to explore our chef specials?"
            elif allergen_avoid:
                reply = f"To ensure your absolute safety regarding {allergen_avoid}, please verify with our dining service captain. Our kitchen handles shared preparation surfaces."
            else:
                reply = "I couldn't find a direct match on our current menu. Feel free to ask about our signature dishes, vegetarian options, or light starters."

            return CustomerAIChatResponse(
                reply=reply,
                recommended_dishes=[],
                grounded_in_menu=True,
                suggested_followups=["Show vegetarian starters", "What are your chef specials?", "Dishes under ₹400"]
            )

        # Top 3 recommended dishes
        recommended = filtered_items[:3]
        citations = [
            DishRecommendationCitation(
                dish_id=item.id,
                name=item.name,
                price=item.price,
                currency=item.currency or "INR",
                dietary_badges=item.dietary_badges or [],
                allergens=item.allergens or [],
                image_url=item.image_url,
                spice_level=item.spice_level or "mild",
                confidence_rationale="Verified active on restaurant digital menu."
            )
            for item in recommended
        ]

        # Synthesize gracious luxury response grounded in actual menu records
        dish_summaries = ", ".join([f"{item.name} (₹{int(item.price)})" for item in recommended])
        
        system_prompt = (
            "You are the sophisticated digital sommelier and AI dining host at a luxury Indian fine-dining restaurant. "
            "Respond in 2-3 gracious, welcoming sentences. Reference the exact dishes provided. "
            "Never invent prices, ingredients, or discounts."
        )

        user_prompt = (
            f"Customer query: '{req.message}'\n"
            f"Verified matching menu items: {dish_summaries}\n"
            "Craft a polished, appetizing recommendation honoring the diner's request."
        )

        try:
            llm_text = await llm_client.generate_text(user_prompt, system_instruction=system_prompt)
            reply_text = llm_text.strip()
        except Exception:
            reply_text = f"We are pleased to recommend {dish_summaries}, prepared fresh by our master culinary brigade."

        return CustomerAIChatResponse(
            reply=reply_text,
            recommended_dishes=citations,
            grounded_in_menu=True,
            suggested_followups=["Add first item to cart", "Tell me about ingredients", "Any beverage pairing?"]
        )

menu_rag_service = MenuRAGService()
