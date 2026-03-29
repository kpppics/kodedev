"""
Clip Engine - Handles video clip fetching using yt-dlp
"""
import os
import subprocess
import logging
from pathlib import Path
from typing import List

logger = logging.getLogger(__name__)


class ClipEngine:
    """Downloads and manages video clips"""

    def __init__(self, temp_dir: str = "temp"):
        """Initialize Clip Engine"""
        self.temp_dir = Path(temp_dir)
        self.temp_dir.mkdir(parents=True, exist_ok=True)

    def fetch_clips(self, keywords: List[str], count: int = 4) -> List[str]:
        """
        Fetch video clips using yt-dlp

        Args:
            keywords: List of search keywords
            count: Number of clips to fetch

        Returns:
            List of file paths to downloaded clips
        """
        clips = []

        for i, keyword in enumerate(keywords[:count]):
            try:
                clip_path = self._download_clip(keyword, i + 1)
                if clip_path and os.path.exists(clip_path):
                    clips.append(clip_path)
                    logger.info(f"Downloaded clip {i+1}: {clip_path}")
                else:
                    logger.warning(f"Failed to download clip for keyword: {keyword}")

            except Exception as e:
                logger.error(f"Error downloading clip for '{keyword}': {e}")

        # Ensure we have at least some clips
        if not clips:
            logger.error("No clips were downloaded successfully")

        return clips

    def _download_clip(self, keyword: str, index: int) -> str:
        """
        Download a single clip using yt-dlp

        Args:
            keyword: Search keyword
            index: Clip index for naming

        Returns:
            Path to downloaded file or None
        """
        output_path = self.temp_dir / f"clip{index}.mp4"

        # Skip if already exists
        if output_path.exists():
            logger.info(f"Clip {index} already exists, skipping download")
            return str(output_path)

        try:
            # yt-dlp search command with limits to reduce file size
            cmd = [
                "yt-dlp",
                f"ytsearch5:{keyword}",
                "-f", "best[filesize<50M]/best",  # Limit file size to 50MB
                "-o", str(output_path),
                "--quiet",
                "--no-warnings",
                "-x",  # Extract audio
                "--audio-format", "mp4",
                "--audio-quality", "128",
            ]

            logger.debug(f"Running yt-dlp command for: {keyword}")
            result = subprocess.run(cmd, capture_output=True, timeout=60)

            if result.returncode == 0 and output_path.exists():
                file_size = output_path.stat().st_size / (1024 * 1024)  # MB
                logger.info(f"Downloaded {keyword}: {file_size:.2f}MB")
                return str(output_path)
            else:
                logger.warning(f"yt-dlp failed for {keyword}: {result.stderr.decode()}")
                return None

        except subprocess.TimeoutExpired:
            logger.error(f"Download timeout for keyword: {keyword}")
            return None
        except Exception as e:
            logger.error(f"Error downloading clip: {e}")
            return None

    def clean_temp_files(self):
        """Remove all temporary clip files"""
        try:
            for file in self.temp_dir.glob("clip*.mp4"):
                file.unlink()
                logger.info(f"Cleaned temp file: {file}")
        except Exception as e:
            logger.error(f"Error cleaning temp files: {e}")

    def get_clip_duration(self, clip_path: str) -> float:
        """Get duration of a video clip in seconds"""
        try:
            cmd = [
                "ffprobe",
                "-v", "error",
                "-show_entries", "format=duration",
                "-of", "default=noprint_wrappers=1:nokey=1:noprint_wrappers=1",
                clip_path
            ]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                return float(result.stdout.strip())
        except Exception as e:
            logger.error(f"Error getting clip duration: {e}")
        return 0.0
