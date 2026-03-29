"""
AutoPost Module - Generates videos automatically
Can be run on a schedule to create trending content
"""
import asyncio
import logging
import sys
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from config import (
    GEMINI_API_KEY,
    TEMP_DIR,
    OUTPUT_DIR,
    LOG_LEVEL,
    LOG_FORMAT
)
from ai_director import AIDirector
from clip_engine import ClipEngine
from video_engine import VideoEngine

# ============= LOGGING SETUP =============
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format=LOG_FORMAT
)
logger = logging.getLogger(__name__)


class AutoPostGenerator:
    """Automated video generation system"""

    def __init__(self):
        """Initialize autopost generator"""
        self.ai_director = AIDirector(GEMINI_API_KEY)
        self.clip_engine = ClipEngine(temp_dir=str(TEMP_DIR))
        self.video_engine = VideoEngine(
            output_dir=str(OUTPUT_DIR),
            assets_dir=str(Path(__file__).parent / "assets")
        )

    def generate_video(self, prompt: str = None) -> Path:
        """
        Generate a complete video automatically

        Args:
            prompt: Optional custom prompt. If None, generates trending idea

        Returns:
            Path to generated video or None if failed
        """
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

            # Step 1: Get prompt or idea
            if prompt is None:
                logger.info("Generating trending idea...")
                prompt = self.ai_director.generate_trending_idea()
                logger.info(f"Generated idea: {prompt}")
            else:
                logger.info(f"Using provided prompt: {prompt}")

            # Step 2: Plan video
            logger.info("Planning video structure...")
            video_plan = self.ai_director.plan_video(prompt)
            logger.info(f"Video plan: {video_plan['style']} - {video_plan['pacing']} pacing")

            # Step 3: Download clips
            logger.info(f"Downloading clips with keywords: {video_plan['keywords']}")
            clips = self.clip_engine.fetch_clips(video_plan['keywords'])

            if not clips:
                logger.error("Failed to download any clips")
                return None

            logger.info(f"Downloaded {len(clips)} clips")

            # Step 4: Create video
            output_path = OUTPUT_DIR / f"autopost_{timestamp}.mp4"
            logger.info(f"Creating video: {output_path}")

            success = self.video_engine.create_video(
                clips=clips,
                plan=video_plan,
                output_path=str(output_path)
            )

            if not success:
                logger.error("Failed to create video")
                return None

            file_size = output_path.stat().st_size / (1024 * 1024)
            logger.info(f"✅ Video created successfully: {file_size:.2f}MB")

            # Cleanup temp files
            self.clip_engine.clean_temp_files()

            return output_path

        except Exception as e:
            logger.error(f"Error generating video: {e}", exc_info=True)
            return None

    def generate_batch(self, count: int = 3) -> list:
        """
        Generate multiple videos in sequence

        Args:
            count: Number of videos to generate

        Returns:
            List of paths to generated videos
        """
        results = []

        for i in range(count):
            logger.info(f"\n{'='*50}")
            logger.info(f"Generating video {i+1}/{count}")
            logger.info(f"{'='*50}")

            video_path = self.generate_video()
            if video_path:
                results.append(video_path)
                logger.info(f"Success: {video_path.name}")
            else:
                logger.warning(f"Failed to generate video {i+1}")

            # Wait between videos to avoid rate limiting
            if i < count - 1:
                logger.info("Waiting 30 seconds before next video...")
                import time
                time.sleep(30)

        return results

    def save_metadata(self, video_path: Path, metadata: dict):
        """
        Save metadata about generated video

        Args:
            video_path: Path to video file
            metadata: Dictionary with video metadata
        """
        try:
            metadata_path = video_path.with_suffix('.json')

            import json
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=2)

            logger.info(f"Metadata saved: {metadata_path}")

        except Exception as e:
            logger.error(f"Failed to save metadata: {e}")


# ============= COMMAND LINE INTERFACE =============

async def main():
    """Main function for command line usage"""
    import argparse

    parser = argparse.ArgumentParser(
        description="AutoPost - Automated video generation system"
    )
    parser.add_argument(
        "--prompt",
        type=str,
        help="Custom prompt for video generation"
    )
    parser.add_argument(
        "--batch",
        type=int,
        default=1,
        help="Number of videos to generate (default: 1)"
    )
    parser.add_argument(
        "--output",
        type=str,
        default="output",
        help="Output directory for videos"
    )

    args = parser.parse_args()

    # Validate API key
    if GEMINI_API_KEY == "PASTE_GEMINI_API_KEY_HERE":
        logger.error("❌ Gemini API key not configured!")
        logger.error("Please edit config.py and set GEMINI_API_KEY")
        return

    # Create generator
    generator = AutoPostGenerator()

    try:
        if args.batch > 1:
            # Generate multiple videos
            logger.info(f"🚀 Generating {args.batch} videos...")
            results = generator.generate_batch(count=args.batch)

            logger.info(f"\n{'='*50}")
            logger.info(f"Batch generation complete!")
            logger.info(f"Generated {len(results)} videos")
            for i, path in enumerate(results, 1):
                size = path.stat().st_size / (1024 * 1024)
                logger.info(f"  {i}. {path.name} ({size:.2f}MB)")

        else:
            # Generate single video
            logger.info(f"🚀 Generating video...")
            if args.prompt:
                logger.info(f"Prompt: {args.prompt}")

            video_path = generator.generate_video(prompt=args.prompt)

            if video_path:
                size = video_path.stat().st_size / (1024 * 1024)
                logger.info(f"\n✅ Video created: {video_path}")
                logger.info(f"📊 Size: {size:.2f}MB")
            else:
                logger.error("❌ Failed to generate video")

    except KeyboardInterrupt:
        logger.info("\n⏹️  Generation interrupted by user")
    except Exception as e:
        logger.error(f"Fatal error: {e}", exc_info=True)


if __name__ == "__main__":
    asyncio.run(main())
