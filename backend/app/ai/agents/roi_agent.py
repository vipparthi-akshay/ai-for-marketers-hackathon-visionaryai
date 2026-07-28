import json
from app.ai.clients import ai_client
from app.ai.prompts.templates import (
    ROI_PREDICTION_PROMPT,
    ROI_PREDICTION_SYSTEM,
    safe_format,
)


async def predict_roi(
    business_name: str,
    industry: str,
    budget: float,
    campaign_count: int,
    target_audience: str,
    historical_data: dict | None = None,
) -> dict:
    historical_str = json.dumps(historical_data) if historical_data else "No historical data available"

    prompt = safe_format(
        ROI_PREDICTION_PROMPT,
        business_name=business_name,
        industry=industry,
        budget=f"${budget:,.2f}",
        campaign_count=campaign_count,
        target_audience=target_audience or "General audience",
        historical_data=historical_str,
    )

    result = await ai_client.generate_json(
        prompt=prompt,
        system_instruction=ROI_PREDICTION_SYSTEM,
        use_pro=True,
        temperature=0.6,
    )

    return result
