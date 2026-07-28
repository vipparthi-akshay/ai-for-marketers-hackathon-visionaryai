from app.ai.clients import ai_client
from app.ai.prompts.templates import (
    PERSONA_GENERATOR_PROMPT,
    PERSONA_GENERATOR_SYSTEM,
    safe_format,
)


async def generate_personas(business) -> dict:
    prompt = safe_format(
        PERSONA_GENERATOR_PROMPT,
        name=business.name,
        industry=business.industry,
        description=business.description or "Not provided",
        products=", ".join(business.products) if business.products else "Not provided",
        target_audience=business.target_audience or "Not provided",
        marketing_goals=", ".join(business.marketing_goals) if business.marketing_goals else "Not provided",
    )

    result = await ai_client.generate_json(
        prompt=prompt,
        system_instruction=PERSONA_GENERATOR_SYSTEM,
        use_pro=True,
        temperature=0.8,
    )

    return result
