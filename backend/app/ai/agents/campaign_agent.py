from app.ai.clients import ai_client
from app.ai.prompts.templates import (
    CAMPAIGN_BUILDER_PROMPT,
    CAMPAIGN_BUILDER_SYSTEM,
    safe_format,
)


async def build_campaign(
    business_name: str,
    industry: str,
    objective: str,
    budget: float,
    duration: int,
    target_audience: str,
    platforms: list[str],
) -> dict:
    prompt = safe_format(
        CAMPAIGN_BUILDER_PROMPT,
        business_name=business_name,
        industry=industry,
        objective=objective,
        budget=f"${budget:,.2f}",
        duration=duration,
        target_audience=target_audience or "General audience",
        platforms=", ".join(platforms) if platforms else "Not specified",
    )

    result = await ai_client.generate_json(
        prompt=prompt,
        system_instruction=CAMPAIGN_BUILDER_SYSTEM,
        use_pro=True,
        temperature=0.7,
    )

    return result
