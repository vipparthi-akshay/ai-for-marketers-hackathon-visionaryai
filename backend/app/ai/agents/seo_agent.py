from app.ai.clients import ai_client
from app.ai.prompts.templates import (
    SEO_ENGINE_PROMPT,
    SEO_ENGINE_SYSTEM,
)


async def analyze_seo(
    business_name: str,
    industry: str,
    website_url: str,
    description: str,
) -> dict:
    prompt = SEO_ENGINE_PROMPT.format(
        business_name=business_name,
        industry=industry,
        website_url=website_url or "Not provided",
        description=description or "Not provided",
    )

    result = await ai_client.generate_json(
        prompt=prompt,
        system_instruction=SEO_ENGINE_SYSTEM,
        use_pro=True,
        temperature=0.6,
    )

    return result
