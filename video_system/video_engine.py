"""
Video Engine - Handles video composition using FFmpeg
"""
import os
import subprocess
import logging
from pathlib import Path
from typing import List, Dict, Any

logger = logging.getLogger(__name__)


class VideoEngine:
    """Assembles video from clips with effects, captions, and music"""

    def __init__(self, output_dir: str = "output", assets_dir: str = "assets"):
        """Initialize Video Engine"""
        self.output_dir = Path(output_dir)
        self.assets_dir = Path(assets_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

        # Video format constants
        self.WIDTH = 1080
        self.HEIGHT = 1920
        self.FPS = 30
        self.CRF = 18

    def create_video(
        self,
        clips: List[str],
        plan: Dict[str, Any],
        output_path: str = "output/final.mp4"
    ) -> bool:
        """
        Create final video from clips with all effects and captions

        Args:
            clips: List of video clip paths
            plan: Video plan from AI Director
            output_path: Path for output video

        Returns:
            True if successful, False otherwise
        """
        try:
            if not clips:
                logger.error("No clips provided for video creation")
                return False

            output_file = Path(output_path)
            output_file.parent.mkdir(parents=True, exist_ok=True)

            # Build FFmpeg command
            cmd = self._build_ffmpeg_command(clips, plan, str(output_file))

            logger.info(f"Building video: {output_file}")
            logger.debug(f"FFmpeg command: {' '.join(cmd[:20])}...")

            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=600  # 10 minute timeout
            )

            if result.returncode == 0 and output_file.exists():
                file_size = output_file.stat().st_size / (1024 * 1024)
                logger.info(f"Video created successfully: {file_size:.2f}MB")
                return True
            else:
                logger.error(f"FFmpeg failed: {result.stderr}")
                return False

        except subprocess.TimeoutExpired:
            logger.error("Video creation timeout")
            return False
        except Exception as e:
            logger.error(f"Error creating video: {e}")
            return False

    def _build_ffmpeg_command(
        self,
        clips: List[str],
        plan: Dict[str, Any],
        output_path: str
    ) -> List[str]:
        """Build FFmpeg command with filters"""

        # Base command
        cmd = ["ffmpeg", "-y"]

        # Add input files
        for clip in clips:
            cmd.extend(["-i", clip])

        # Add background music if exists
        music_path = self.assets_dir / "music" / "background.mp3"
        if music_path.exists():
            cmd.extend(["-i", str(music_path)])

        # Build complex filter
        filter_str = self._build_filter_graph(len(clips), plan)

        cmd.extend(["-filter_complex", filter_str])

        # Audio mixing
        if music_path.exists():
            cmd.extend([
                "-map", "[vout]",
                "-map", f"[aout]",
                "-c:a", "aac",
                "-b:a", "128k"
            ])
        else:
            cmd.extend([
                "-map", "[vout]",
                "-c:a", "aac",
                "-b:a", "128k"
            ])

        # Video codec settings
        cmd.extend([
            "-c:v", "libx264",
            "-crf", str(self.CRF),
            "-preset", "medium",
            "-r", str(self.FPS),
            "-pix_fmt", "yuv420p"
        ])

        cmd.append(output_path)

        return cmd

    def _build_filter_graph(self, num_clips: int, plan: Dict[str, Any]) -> str:
        """Build FFmpeg filter graph with zoom, captions, and effects"""

        filters = []
        hook_text = plan.get("hook", "")
        main_text = plan.get("main", "")
        ending_text = plan.get("ending", "")

        # Process each clip with zoom effect
        clip_labels = []
        for i in range(num_clips):
            label = f"clip{i}"

            # Scale to fit vertical video, preserve aspect ratio
            scale_filter = f"[{i}]scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2[{label}_padded]"
            filters.append(scale_filter)

            # Apply zoom effect
            zoom_filter = f"[{label}_padded]zoompan=z='min(zoom+0.002,1.1)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920,fps={self.FPS}[{label}]"
            filters.append(zoom_filter)

            clip_labels.append(f"[{label}]")

        # Concatenate all clips
        concat_filter = "".join(clip_labels) + f"concat=n={num_clips}:v=1:a=0[concat_vid]"
        filters.append(concat_filter)

        # Add captions/text overlay
        caption_filter = self._build_caption_filter(hook_text, main_text, ending_text)
        if caption_filter:
            filters.append(caption_filter)

        # Audio processing (mix with background music if exists)
        if num_clips > 0:
            # If music exists, we'll mix audio from video and music
            audio_label = "concat_vid_with_text" if caption_filter else "concat_vid"
            filters.append(f"[{audio_label}]format=pix_fmts=yuv420p[vout]")

        # Combine all filters
        filter_str = ";".join(filters)

        # Add audio mixing if background music exists
        music_path = self.assets_dir / "music" / "background.mp3"
        if music_path.exists():
            # Get the last video label
            last_video_label = filters[-1].split("[")[1]
            filter_str += f";[1:a]volume=0.3[music_audio];[{last_video_label}][music_audio]amix=inputs=2:duration=first[aout]"
        else:
            filter_str += ";anull[aout]"

        return filter_str

    def _build_caption_filter(
        self,
        hook_text: str,
        main_text: str,
        ending_text: str
    ) -> str:
        """Build text overlay filter for captions"""

        # Escape special characters for FFmpeg
        hook_text = self._escape_ffmpeg_text(hook_text)
        main_text = self._escape_ffmpeg_text(main_text)
        ending_text = self._escape_ffmpeg_text(ending_text)

        # Create text overlay with timing
        filters = []

        # Hook (0-2 seconds)
        if hook_text:
            hook_filter = (
                f"[concat_vid]drawtext="
                f"text='{hook_text}':"
                f"fontsize=60:"
                f"fontcolor=white:"
                f"bordercolor=black:"
                f"borderw=3:"
                f"x=(w-text_w)/2:y=h/2-text_h/2:"
                f"enable='between(t,0,2)'[hook_txt]"
            )
            filters.append(hook_filter)

        # Main (2-6 seconds)
        if main_text:
            main_filter = (
                f"[{'hook_txt' if hook_text else 'concat_vid'}]drawtext="
                f"text='{main_text}':"
                f"fontsize=48:"
                f"fontcolor=white:"
                f"bordercolor=black:"
                f"borderw=2:"
                f"x=(w-text_w)/2:y=h/2-text_h/2:"
                f"enable='between(t,2,6)'[main_txt]"
            )
            filters.append(main_filter)

        # Ending (last 2 seconds)
        if ending_text:
            ending_filter = (
                f"[{'main_txt' if main_text else 'hook_txt' if hook_text else 'concat_vid'}]drawtext="
                f"text='{ending_text}':"
                f"fontsize=60:"
                f"fontcolor=white:"
                f"bordercolor=black:"
                f"borderw=3:"
                f"x=(w-text_w)/2:y=h/2-text_h/2:"
                f"enable='gte(t,9)'[ending_txt]"
            )
            filters.append(ending_filter)

        if filters:
            return ";".join(filters)
        return ""

    def _escape_ffmpeg_text(self, text: str) -> str:
        """Escape special characters for FFmpeg drawtext filter"""
        # Replace problematic characters
        replacements = {
            "'": "\\'",
            ":": "\\:",
            "\\": "\\\\",
            "[": "\\[",
            "]": "\\]",
            "\n": " ",
            "\r": " "
        }
        for old, new in replacements.items():
            text = text.replace(old, new)
        return text[:100]  # Limit text length

    def get_output_path(self) -> str:
        """Get default output path"""
        return str(self.output_dir / "final.mp4")

    def cleanup_output(self):
        """Remove output files"""
        try:
            output_file = self.output_dir / "final.mp4"
            if output_file.exists():
                output_file.unlink()
                logger.info("Cleaned output file")
        except Exception as e:
            logger.error(f"Error cleaning output: {e}")
