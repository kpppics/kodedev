"""
OpenClaw AI Video Generation System
Automated short-form video creation for TikTok, YouTube Shorts, etc.
"""

from .ai_director import AIDirector
from .clip_engine import ClipEngine
from .video_engine import VideoEngine

__version__ = "1.0.0"
__author__ = "OpenClaw"
__all__ = ["AIDirector", "ClipEngine", "VideoEngine"]
