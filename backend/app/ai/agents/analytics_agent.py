from app.ai.clients import ai_client
from app.ai.prompts.templates import (
    ANALYTICS_PREDICTION_PROMPT,
    ANALYTICS_PREDICTION_SYSTEM,
    safe_format,
)


async def predict_analytics(
    business_name: str,
    industry: str,
    budget: float,
    campaign_count: int,
    content_count: int,
    target_audience: str,
) -> dict:
    prompt = safe_format(
        ANALYTICS_PREDICTION_PROMPT,
        business_name=business_name,
        industry=industry,
        budget=f"${budget:,.2f}",
        campaign_count=campaign_count,
        content_count=content_count,
        target_audience=target_audience or "General audience",
    )

    result = await ai_client.generate_json(
        prompt=prompt,
        system_instruction=ANALYTICS_PREDICTION_SYSTEM,
        use_pro=True,
        temperature=0.6,
    )

    return result
