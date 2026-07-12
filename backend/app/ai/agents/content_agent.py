from app.ai.clients import ai_client
from app.ai.prompts.templates import (
    CONTENT_ENGINE_PROMPT,
    CONTENT_ENGINE_SYSTEM,
)


async def generate_content(
    business_name: str,
    industry: str,
    target_audience: str,
    content_type: str,
    platform: str,
    tone: str = "professional",
    topic: str = "",
    instructions: str = "",
) -> dict:
    prompt = CONTENT_ENGINE_PROMPT.format(
        content_type=content_type,
        business_name=business_name,
        industry=industry,
        target_audience=target_audience or "General audience",
        tone=tone,
        platform=platform,
        topic=topic or "General marketing",
        instructions=instructions or "None",
    )

    result = await ai_client.generate_json(
        prompt=prompt,
        system_instruction=CONTENT_ENGINE_SYSTEM,
        temperature=0.8,
    )

    return result
