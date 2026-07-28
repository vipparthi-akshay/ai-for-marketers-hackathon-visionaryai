from app.ai.clients import ai_client
from app.ai.prompts.templates import (
    BRAND_VOICE_PROMPT,
    BRAND_VOICE_SYSTEM,
    safe_format,
)


async def generate_brand_voice(
    business_name: str,
    industry: str,
    description: str,
    brand_voice: str,
    target_audience: str,
) -> dict:
    prompt = safe_format(
        BRAND_VOICE_PROMPT,
        business_name=business_name,
        industry=industry,
        description=description or "Not provided",
        brand_voice=brand_voice or "Not defined yet",
        target_audience=target_audience or "General audience",
    )

    result = await ai_client.generate_json(
        prompt=prompt,
        system_instruction=BRAND_VOICE_SYSTEM,
        use_pro=True,
        temperature=0.7,
    )

    return result
