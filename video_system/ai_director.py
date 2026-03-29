"""
AI Director Module - Handles video planning and script generation using Gemini
"""
import json
import logging
from typing import Dict, Any
import google.generativeai as genai

logger = logging.getLogger(__name__)


class AIDirector:
    """Generates video structure and content using Gemini Flash"""

    def __init__(self, api_key: str):
        """Initialize AI Director with Gemini API key"""
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    def plan_video(self, prompt: str) -> Dict[str, Any]:
        """
        Analyze user prompt and generate video plan

        Args:
            prompt: User's video request

        Returns:
            Dictionary with video structure
        """
        try:
            planning_prompt = f"""
            Analyze this video request and return a JSON object with the following structure:
            {{
                "hook": "A 2-second hook/intro that grabs attention",
                "main": "The main content/body text",
                "ending": "A 2-second ending/CTA",
                "scenes": ["scene1", "scene2", "scene3", "scene4"],
                "keywords": ["keyword1", "keyword2", "keyword3"],
                "style": "Style category (e.g., cleaning, satisfying, transformation, before-after)",
                "pacing": "fast or slow",
                "music_type": "calm, energetic, dramatic, or uplifting",
                "duration_seconds": 15
            }}

            User request: {prompt}

            Return ONLY valid JSON, no other text.
            """

            response = self.model.generate_content(planning_prompt)

            # Extract JSON from response
            text = response.text.strip()

            # Remove markdown code blocks if present
            if text.startswith('```'):
                text = text.split('```')[1]
                if text.startswith('json'):
                    text = text[4:]
                text = text.strip()

            video_plan = json.loads(text)

            # Validate required fields
            required_fields = ["hook", "main", "ending", "scenes", "keywords", "style", "pacing", "music_type"]
            for field in required_fields:
                if field not in video_plan:
                    logger.warning(f"Missing field in AI response: {field}")
                    video_plan[field] = ""

            logger.info(f"Video plan created: {video_plan['style']}")
            return video_plan

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response as JSON: {e}")
            return self._default_plan(prompt)
        except Exception as e:
            logger.error(f"Error in AI planning: {e}")
            return self._default_plan(prompt)

    def _default_plan(self, prompt: str) -> Dict[str, Any]:
        """Return a safe default plan if AI fails"""
        return {
            "hook": "Check this out",
            "main": prompt[:50],
            "ending": "Subscribe for more",
            "scenes": ["scene1", "scene2", "scene3"],
            "keywords": ["satisfying", "timelapse", "transformation"],
            "style": "satisfying",
            "pacing": "fast",
            "music_type": "energetic",
            "duration_seconds": 15
        }

    def generate_trending_idea(self) -> str:
        """Generate a trending video idea automatically"""
        try:
            prompt = """
            Generate ONE trending short-form video idea (TikTok/YouTube Shorts style).
            Make it creative, engaging, and achievable with stock footage.
            Return ONLY the idea as a single sentence/prompt, no other text.
            """

            response = self.model.generate_content(prompt)
            idea = response.text.strip()
            logger.info(f"Generated trending idea: {idea}")
            return idea

        except Exception as e:
            logger.error(f"Error generating trending idea: {e}")
            return "Make a satisfying cleaning transformation video"
