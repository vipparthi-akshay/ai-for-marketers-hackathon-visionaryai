from app.ai.clients import ai_client
from app.ai.prompts.templates import (
    AUTOMATION_WORKFLOW_PROMPT,
    AUTOMATION_WORKFLOW_SYSTEM,
    safe_format,
)


async def generate_workflow(
    business_name: str,
    industry: str,
    workflow_type: str,
    goal: str,
) -> dict:
    prompt = safe_format(
        AUTOMATION_WORKFLOW_PROMPT,
        business_name=business_name,
        industry=industry,
        workflow_type=workflow_type,
        goal=goal,
    )

    result = await ai_client.generate_json(
        prompt=prompt,
        system_instruction=AUTOMATION_WORKFLOW_SYSTEM,
        temperature=0.7,
    )

    return result
