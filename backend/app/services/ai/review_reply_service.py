from typing import Optional
from app.models.review import CustomerReview
from app.services.ai.llm_provider import llm_client

class ReviewReplyService:
    """Generates personalized, responsible customer review replies with tone and language control."""

    @classmethod
    async def generate_reply(
        cls,
        review: CustomerReview,
        tone: str = "PROFESSIONAL",
        language: str = "EN",
        restaurant_name: str = "The Royal Saffron"
    ) -> str:
        system_instruction = (
            f"You are the General Manager at {restaurant_name}, a distinguished luxury dining establishment. "
            "Compose a thoughtful, authentic reply to a guest review. "
            "CRITICAL POLICIES:\n"
            "1. NEVER offer free meals, discounts, refunds, or financial compensation.\n"
            "2. NEVER invent non-existent staff or make promises about specific personnel.\n"
            "3. If the review is negative, apologize sincerely for not meeting expectations and invite them to connect privately with management.\n"
            "4. If the review is positive, thank them warmly and acknowledge their appreciation.\n"
            "5. Keep the reply between 2 and 4 sentences."
        )

        tone_guidance = {
            "PROFESSIONAL": "Polite, dignified, respectful, and articulate.",
            "WARM": "Heartfelt, gracious, hospitable, and genuinely appreciative.",
            "CONCISE": "Brief, elegant, and directly to the point."
        }.get(tone.upper(), "Polite and hospitable.")

        lang_guidance = {
            "EN": "Write in refined, fluent English.",
            "HI": "Write in respectful, formal Hindi (Devanagari script).",
            "HINGLISH": "Write in contemporary, respectful Hinglish blending English and polite Hindi expressions."
        }.get(language.upper(), "Write in English.")

        prompt = (
            f"Guest Name: {review.customer_name or 'Valued Diner'}\n"
            f"Rating: {review.rating} out of 5 stars\n"
            f"Review: \"{review.review_text}\"\n"
            f"Sentiment: {review.sentiment}\n"
            f"Tone: {tone_guidance}\n"
            f"Language: {lang_guidance}\n\n"
            "Produce the final reply message only."
        )

        try:
            reply = await llm_client.generate_text(prompt, system_instruction=system_instruction)
            return reply.strip(' "')
        except Exception:
            # Deterministic safe fallback
            if review.rating >= 4:
                return (
                    f"Dear {review.customer_name or 'Guest'}, thank you for dining with us at {restaurant_name}. "
                    "We are truly delighted to know you had an exceptional experience, and our entire brigade looks forward to your next visit."
                )
            else:
                return (
                    f"Dear {review.customer_name or 'Guest'}, thank you for sharing your candid feedback. "
                    f"At {restaurant_name}, we hold our hospitality to the highest standards, and we regret that your experience fell short. "
                    "Our management team has taken note of your comments to ensure our service standards remain exemplary."
                )

review_reply_service = ReviewReplyService()
