import json
import logging
from typing import Any

import google.generativeai as genai

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class AIClient:
    def __init__(self):
        if settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self._model = genai.GenerativeModel("gemini-1.5-flash")
            self._pro_model = genai.GenerativeModel("gemini-1.5-pro")
        else:
            self._model = None
            self._pro_model = None
            logger.warning("GEMINI_API_KEY not set. AI features will use fallback.")

    async def generate(
        self,
        prompt: str,
        system_instruction: str | None = None,
        use_pro: bool = False,
        temperature: float = 0.7,
    ) -> str:
        model = self._pro_model if use_pro else self._model

        if model is None:
            return self._fallback_response(prompt)

        try:
            generation_config = genai.types.GenerationConfig(
                temperature=temperature,
                max_output_tokens=8192,
            )

            if system_instruction:
                response = await model.generate_content_async(
                    prompt,
                    generation_config=generation_config,
                    system_instruction=system_instruction,
                )
            else:
                response = await model.generate_content_async(
                    prompt,
                    generation_config=generation_config,
                )

            return response.text

        except Exception as e:
            logger.error(f"AI generation error: {e}")
            return self._fallback_response(prompt)

    async def generate_json(
        self,
        prompt: str,
        system_instruction: str | None = None,
        use_pro: bool = False,
        temperature: float = 0.7,
    ) -> dict[str, Any]:
        json_instruction = (
            (system_instruction or "") + "\n\nYou MUST respond with valid JSON only. No markdown, no explanation, just JSON."
        )
        response = await self.generate(
            prompt=prompt,
            system_instruction=json_instruction,
            use_pro=use_pro,
            temperature=temperature,
        )

        try:
            cleaned = response.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("\n", 1)[1]
                if cleaned.endswith("```"):
                    cleaned = cleaned[:-3]
            return json.loads(cleaned)
        except json.JSONDecodeError:
            logger.warning(f"Failed to parse AI response as JSON: {response[:200]}")
            return {"raw_response": response}

    def _fallback_response(self, prompt: str) -> str:
        return (
            "AI service is temporarily unavailable. "
            "Please configure GEMINI_API_KEY in your .env file to enable AI features."
        )


ai_client = AIClient()
