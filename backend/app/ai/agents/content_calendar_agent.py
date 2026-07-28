from app.ai.clients import ai_client
from app.ai.prompts.templates import (
    CONTENT_CALENDAR_PROMPT,
    CONTENT_CALENDAR_SYSTEM,
    safe_format,
)


async def generate_content_calendar(
    business_name: str,
    industry: str,
    target_audience: str,
    platforms: str,
    goals: str,
    timeframe: str = "monthly",
) -> dict:
    prompt = safe_format(
        CONTENT_CALENDAR_PROMPT,
        business_name=business_name,
        industry=industry,
        target_audience=target_audience or "General audience",
        platforms=platforms or "All platforms",
        goals=goals or "Increase brand awareness",
        timeframe=timeframe,
    )

    result = await ai_client.generate_json(
        prompt=prompt,
        system_instruction=CONTENT_CALENDAR_SYSTEM,
        temperature=0.7,
    )

    return result
