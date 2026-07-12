from app.ai.clients import ai_client
from app.ai.prompts.templates import (
    BUSINESS_ANALYZER_PROMPT,
    BUSINESS_ANALYZER_SYSTEM,
)


async def analyze_business_profile(business) -> dict:
    prompt = BUSINESS_ANALYZER_PROMPT.format(
        name=business.name,
        industry=business.industry,
        description=business.description or "Not provided",
        products=", ".join(business.products) if business.products else "Not provided",
        target_audience=business.target_audience or "Not provided",
        marketing_goals=", ".join(business.marketing_goals) if business.marketing_goals else "Not provided",
        budget_range=business.budget_range or "Not provided",
    )

    result = await ai_client.generate_json(
        prompt=prompt,
        system_instruction=BUSINESS_ANALYZER_SYSTEM,
        use_pro=True,
        temperature=0.7,
    )

    return result
