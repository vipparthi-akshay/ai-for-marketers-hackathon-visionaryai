from app.ai.clients import ai_client
from app.ai.prompts.templates import (
    COMPETITOR_ANALYSIS_PROMPT,
    COMPETITOR_ANALYSIS_SYSTEM,
    safe_format,
)


async def analyze_competitor(
    business_name: str,
    industry: str,
    description: str,
    website_url: str,
    target_audience: str,
) -> dict:
    prompt = safe_format(
        COMPETITOR_ANALYSIS_PROMPT,
        business_name=business_name,
        industry=industry,
        description=description or "Not provided",
        website_url=website_url or "Not provided",
        target_audience=target_audience or "Not provided",
    )

    result = await ai_client.generate_json(
        prompt=prompt,
        system_instruction=COMPETITOR_ANALYSIS_SYSTEM,
        use_pro=True,
        temperature=0.7,
    )

    return result
