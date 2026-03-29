"""
Telegram OpenClaw Bot - Automated AI Video Generation System
Main bot file that handles Telegram integration and video generation pipeline
"""
import asyncio
import logging
import os
import sys
from pathlib import Path

from telegram import Update
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from config import (
    TELEGRAM_BOT_TOKEN,
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

# ============= GLOBAL INSTANCES =============
ai_director = None
clip_engine = None
video_engine = None


# ============= TELEGRAM HANDLERS =============

async def start_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /start command"""
    welcome_text = """
🎬 Welcome to OpenClaw Video Generator!

Commands:
/makevideo <prompt> - Generate a video from your idea
/autopost - Generate and create a trending video automatically
/help - Show this help message

Example:
/makevideo make me a dirty room to clean room timelapse video
    """
    await update.message.reply_text(welcome_text)
    logger.info(f"User {update.effective_user.id} started the bot")


async def help_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /help command"""
    help_text = """
📖 OpenClaw Video Generator Help

/makevideo <prompt>
  Generate a professional short-form video from your text prompt.
  The system will:
  1. Understand your request using AI
  2. Generate a video script with hooks and captions
  3. Fetch relevant video clips
  4. Compose with effects, zoom, and music
  5. Return the final video

/autopost
  Generate a trending video idea automatically using AI.
  Great for random inspiration!

/status
  Check the current status

Tips:
- Be descriptive in your prompts
- Videos are optimized for TikTok/YouTube Shorts (1080x1920)
- Processing takes 1-3 minutes per video
- Max video size: 50MB for Telegram
    """
    await update.message.reply_text(help_text)


async def makevideo_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /makevideo command"""
    if not context.args:
        await update.message.reply_text(
            "Please provide a prompt: /makevideo <your prompt>\n"
            "Example: /makevideo make a satisfying cleaning video"
        )
        return

    user_prompt = " ".join(context.args)
    user_id = update.effective_user.id
    chat_id = update.effective_chat.id

    try:
        # Notify user
        status_msg = await update.message.reply_text(
            f"🎬 Creating video from: '{user_prompt}'\n\n"
            "⏳ Step 1/4: Planning video structure..."
        )

        # Step 1: AI Planning
        logger.info(f"User {user_id}: Planning video for '{user_prompt}'")
        video_plan = ai_director.plan_video(user_prompt)
        logger.info(f"Video plan created: {video_plan['style']}")

        # Update status
        await status_msg.edit_text(
            f"🎬 Creating video from: '{user_prompt}'\n\n"
            "⏳ Step 2/4: Fetching video clips..."
        )

        # Step 2: Download clips
        logger.info(f"Downloading clips with keywords: {video_plan['keywords']}")
        clips = clip_engine.fetch_clips(video_plan['keywords'])

        if not clips:
            logger.warning(f"No clips downloaded for user {user_id}")
            await status_msg.edit_text(
                "❌ Failed to fetch video clips. Please try again later."
            )
            return

        logger.info(f"Downloaded {len(clips)} clips")

        # Update status
        await status_msg.edit_text(
            f"🎬 Creating video from: '{user_prompt}'\n\n"
            "⏳ Step 3/4: Composing video with effects..."
        )

        # Step 3: Build video
        output_path = OUTPUT_DIR / f"video_{user_id}_{update.message.message_id}.mp4"
        logger.info(f"Building video to: {output_path}")

        success = video_engine.create_video(
            clips=clips,
            plan=video_plan,
            output_path=str(output_path)
        )

        if not success or not output_path.exists():
            logger.error(f"Video creation failed for user {user_id}")
            await status_msg.edit_text(
                "❌ Failed to create video. Please try again."
            )
            return

        file_size = output_path.stat().st_size / (1024 * 1024)
        logger.info(f"Video created: {file_size:.2f}MB")

        # Update status
        await status_msg.edit_text(
            f"🎬 Creating video from: '{user_prompt}'\n\n"
            "⏳ Step 4/4: Uploading to Telegram..."
        )

        # Step 4: Upload video
        try:
            with open(output_path, 'rb') as video_file:
                await context.bot.send_video(
                    chat_id=chat_id,
                    video=video_file,
                    caption=f"🎬 {video_plan.get('style', 'Video').title()}\n\n{video_plan.get('hook', '')}",
                    supports_streaming=True
                )
            logger.info(f"Video sent to user {user_id}")

        except Exception as e:
            logger.error(f"Failed to send video: {e}")
            await update.message.reply_text(
                f"⚠️ Video created but failed to send: {str(e)[:100]}"
            )

        # Final status
        await status_msg.edit_text(
            f"✅ Video created successfully!\n\n"
            f"📊 Stats:\n"
            f"  Style: {video_plan.get('style', 'Unknown')}\n"
            f"  Size: {file_size:.2f}MB\n"
            f"  Duration: {video_plan.get('duration_seconds', 15)}s"
        )

        # Cleanup temp files
        clip_engine.clean_temp_files()
        logger.info(f"Cleaned temp files for user {user_id}")

        # Cleanup output file after sending
        try:
            output_path.unlink()
        except:
            pass

    except Exception as e:
        logger.error(f"Error in makevideo handler: {e}", exc_info=True)
        await update.message.reply_text(
            f"❌ Error: {str(e)[:100]}"
        )


async def autopost_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /autopost command"""
    user_id = update.effective_user.id
    chat_id = update.effective_chat.id

    try:
        status_msg = await update.message.reply_text(
            "🤖 Generating trending idea...\n\n"
            "⏳ Step 1/4: Creating video concept..."
        )

        # Generate trending idea
        logger.info(f"User {user_id}: Generating trending video idea")
        trend_idea = ai_director.generate_trending_idea()
        logger.info(f"Trending idea: {trend_idea}")

        # Plan the video
        await status_msg.edit_text(
            f"💡 Idea: {trend_idea}\n\n"
            "⏳ Step 2/4: Planning structure..."
        )

        video_plan = ai_director.plan_video(trend_idea)

        # Download clips
        await status_msg.edit_text(
            f"💡 Idea: {trend_idea}\n\n"
            "⏳ Step 3/4: Downloading clips..."
        )

        clips = clip_engine.fetch_clips(video_plan['keywords'])

        if not clips:
            await status_msg.edit_text(
                "❌ Failed to fetch video clips. Please try again."
            )
            return

        # Build video
        await status_msg.edit_text(
            f"💡 Idea: {trend_idea}\n\n"
            "⏳ Step 4/4: Creating video..."
        )

        output_path = OUTPUT_DIR / f"autopost_{user_id}_{update.message.message_id}.mp4"
        success = video_engine.create_video(
            clips=clips,
            plan=video_plan,
            output_path=str(output_path)
        )

        if not success:
            await status_msg.edit_text("❌ Failed to create video.")
            return

        # Send video
        file_size = output_path.stat().st_size / (1024 * 1024)

        try:
            with open(output_path, 'rb') as video_file:
                await context.bot.send_video(
                    chat_id=chat_id,
                    video=video_file,
                    caption=f"🎬 {trend_idea}",
                    supports_streaming=True
                )
            logger.info(f"Autopost video sent to user {user_id}")

        except Exception as e:
            logger.error(f"Failed to send autopost video: {e}")
            await update.message.reply_text(f"⚠️ Failed to send: {str(e)[:100]}")

        # Final status
        await status_msg.edit_text(
            f"✅ Auto-generated video created!\n\n"
            f"📊 Stats:\n"
            f"  Idea: {trend_idea[:50]}...\n"
            f"  Size: {file_size:.2f}MB\n"
            f"  Style: {video_plan.get('style', 'Unknown')}"
        )

        # Cleanup
        clip_engine.clean_temp_files()
        try:
            output_path.unlink()
        except:
            pass

    except Exception as e:
        logger.error(f"Error in autopost handler: {e}", exc_info=True)
        await update.message.reply_text(f"❌ Error: {str(e)[:100]}")


async def status_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /status command"""
    status_text = """
✅ OpenClaw System Status

🤖 AI Director: Ready
🎬 Video Engine: Ready
📥 Clip Engine: Ready
🔔 Telegram Bot: Connected

All systems operational!
    """
    await update.message.reply_text(status_text)


async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle errors"""
    logger.error(f"Update {update} caused error {context.error}")


# ============= MAIN INITIALIZATION =============

async def initialize_systems() -> bool:
    """Initialize all video generation systems"""
    global ai_director, clip_engine, video_engine

    try:
        logger.info("Initializing AI Director...")
        if GEMINI_API_KEY == "PASTE_GEMINI_API_KEY_HERE":
            logger.error("Gemini API key not configured!")
            return False
        ai_director = AIDirector(GEMINI_API_KEY)

        logger.info("Initializing Clip Engine...")
        clip_engine = ClipEngine(temp_dir=str(TEMP_DIR))

        logger.info("Initializing Video Engine...")
        video_engine = VideoEngine(
            output_dir=str(OUTPUT_DIR),
            assets_dir=str(Path(__file__).parent / "assets")
        )

        logger.info("All systems initialized successfully!")
        return True

    except Exception as e:
        logger.error(f"Failed to initialize systems: {e}")
        return False


async def main():
    """Main bot function"""
    global ai_director, clip_engine, video_engine

    # Validate configuration
    if TELEGRAM_BOT_TOKEN == "PASTE_TELEGRAM_BOT_TOKEN_HERE":
        logger.error("Telegram bot token not configured!")
        logger.error("Please edit config.py and set TELEGRAM_BOT_TOKEN")
        return

    # Initialize systems
    if not await initialize_systems():
        logger.error("Failed to initialize systems!")
        return

    # Create bot application
    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()

    # Add handlers
    application.add_handler(CommandHandler("start", start_handler))
    application.add_handler(CommandHandler("help", help_handler))
    application.add_handler(CommandHandler("makevideo", makevideo_handler))
    application.add_handler(CommandHandler("autopost", autopost_handler))
    application.add_handler(CommandHandler("status", status_handler))

    # Error handler
    application.add_error_handler(error_handler)

    # Start bot
    logger.info("Starting Telegram bot...")
    await application.initialize()
    await application.start()
    await application.updater.start_polling()

    logger.info("Bot is running. Press Ctrl+C to stop.")

    try:
        # Keep the bot running
        await asyncio.Event().wait()
    except KeyboardInterrupt:
        logger.info("Shutting down...")
        await application.updater.stop()
        await application.stop()
        await application.shutdown()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Bot stopped")
    except Exception as e:
        logger.error(f"Fatal error: {e}", exc_info=True)
