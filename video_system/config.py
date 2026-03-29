"""
Configuration module - Hardcoded API keys and constants
"""
import os
from pathlib import Path

# ============= REQUIRED CONFIGURATION =============
# Paste your credentials here
TELEGRAM_BOT_TOKEN = "PASTE_TELEGRAM_BOT_TOKEN_HERE"
GEMINI_API_KEY = "PASTE_GEMINI_API_KEY_HERE"

# ============= DIRECTORIES =============
BASE_DIR = Path(__file__).parent
TEMP_DIR = BASE_DIR / "temp"
OUTPUT_DIR = BASE_DIR / "output"
ASSETS_DIR = BASE_DIR / "assets"
MUSIC_DIR = ASSETS_DIR / "music"

# Create directories if they don't exist
TEMP_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
ASSETS_DIR.mkdir(parents=True, exist_ok=True)
MUSIC_DIR.mkdir(parents=True, exist_ok=True)

# ============= VIDEO SETTINGS =============
VIDEO_WIDTH = 1080
VIDEO_HEIGHT = 1920
VIDEO_FPS = 30
VIDEO_CRF = 18  # Quality (lower = better, slower)
VIDEO_DURATION = 15  # seconds

# ============= CLIP SETTINGS =============
MAX_CLIPS = 4
CLIP_DOWNLOAD_TIMEOUT = 60  # seconds
CLIP_MAX_SIZE_MB = 50

# ============= LOGGING =============
LOG_LEVEL = "INFO"
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

# ============= TELEGRAM SETTINGS =============
TELEGRAM_TIMEOUT = 30
MAX_VIDEO_SIZE_MB = 50  # Telegram file upload limit

# ============= FFMPEG SETTINGS =============
FFMPEG_TIMEOUT = 600  # 10 minutes
FFMPEG_PRESET = "medium"  # fast, medium, slow

# ============= MUSIC SETTINGS =============
MUSIC_VOLUME = 0.3  # Volume level for background music
