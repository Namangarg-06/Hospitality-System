import json
from typing import List, Optional
from app.services.ai.llm_provider import llm_client
from app.schemas.menu import DescriptionGenerateRequest, DescriptionGenerateResponse

class MenuDescriptionService:
    @staticmethod
    async def generate_descriptions(req: DescriptionGenerateRequest) -> DescriptionGenerateResponse:
        system_prompt = (
            "You are an executive hospitality copywriter and culinary specialist for a luxury fine-dining restaurant. "
            "Generate captivating, refined menu descriptions for a given dish. "
            "Return valid JSON only with keys: short_description, long_description, description_hi, description_hinglish, suggested_allergens, suggested_keywords. "
            "Never hallucinate non-existent ingredients or make false health/allergy claims."
        )

        prompt = (
            f"Dish: {req.dish_name}\n"
            f"Category: {req.category_name or 'Main'}\n"
            f"Key Ingredients: {', '.join(req.key_ingredients) if req.key_ingredients else 'Traditional aromatic spices'}\n"
            f"Dietary: {req.dietary_type}\n\n"
            "Produce:\n"
            "1. short_description (1 sentence, max 120 chars)\n"
            "2. long_description (2-3 evocative sentences celebrating preparation and mouthfeel)\n"
            "3. description_hi (authentic Hindi, written in Devanagari script)\n"
            "4. description_hinglish (conversational Hindi-English blend popular in Indian luxury casual dining)\n"
            "5. suggested_allergens (list from dairy, nuts, gluten, soy, eggs, none)\n"
            "6. suggested_keywords (list of 4-6 search tags)"
        )

        try:
            raw = await llm_client.generate_text(prompt, system_instruction=system_prompt)
            # Clean markdown code blocks if present
            cleaned = raw.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            
            data = json.loads(cleaned.strip())
            return DescriptionGenerateResponse(
                short_description=data.get("short_description", f"Artisanal {req.dish_name} crafted with aromatic spices."),
                long_description=data.get("long_description", f"Slow-cooked to perfection, our signature {req.dish_name} brings an exquisite symphony of heritage flavors and culinary finesse."),
                description_hi=data.get("description_hi", f"ताज़ा और शुद्ध सामग्री से तैयार {req.dish_name}।"),
                description_hinglish=data.get("description_hinglish", f"Fresh ingredients aur royal spices ke saath banaya gaya {req.dish_name}।"),
                suggested_allergens=data.get("suggested_allergens", ["dairy"]),
                suggested_keywords=data.get("suggested_keywords", [req.dish_name.lower(), "signature", "luxury"])
            )
        except Exception:
            # Deterministic fallback
            return DescriptionGenerateResponse(
                short_description=f"Artisanal {req.dish_name} prepared with fine seasonal ingredients.",
                long_description=f"Slow-simmered by our master chefs, our signature {req.dish_name} blends rich culinary heritage with contemporary elegance.",
                description_hi=f"शाही परंपरा और ताज़ा सामग्री से तैयार {req.dish_name}।",
                description_hinglish=f"Fresh herbs aur authentic spices ke saath cook kiya gaya {req.dish_name}।",
                suggested_allergens=["dairy"],
                suggested_keywords=[req.dish_name.lower(), "chef-special", "delight", "signature"]
            )

menu_desc_service = MenuDescriptionService()
