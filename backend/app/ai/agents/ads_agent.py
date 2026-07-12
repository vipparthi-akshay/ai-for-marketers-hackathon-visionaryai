from app.ai.clients import ai_client
from app.ai.prompts.templates import (
    ADS_GENERATOR_PROMPT,
    ADS_GENERATOR_SYSTEM,
)


async def generate_ads(
    business_name: str,
    industry: str,
    platform: str,
    objective: str,
    budget: float,
    target_audience: str,
) -> dict:
    prompt = ADS_GENERATOR_PROMPT.format(
        business_name=business_name,
        industry=industry,
        platform=platform,
        objective=objective,
        budget=f"${budget:,.2f}",
        target_audience=target_audience or "General audience",
    )

    result = await ai_client.generate_json(
        prompt=prompt,
        system_instruction=ADS_GENERATOR_SYSTEM,
        temperature=0.8,
    )

    return result
