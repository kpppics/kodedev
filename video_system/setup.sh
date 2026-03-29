#!/bin/bash

# OpenClaw Video System - Setup Script
# This script sets up all requirements and directories

set -e

echo "🎬 OpenClaw Video System Setup"
echo "================================"

# Check Python
echo "✓ Checking Python..."
python3 --version

# Check FFmpeg
echo "✓ Checking FFmpeg..."
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ FFmpeg not found. Installing..."
    sudo apt-get update
    sudo apt-get install -y ffmpeg
else
    ffmpeg -version | head -n 1
fi

# Create directories
echo "✓ Creating directories..."
mkdir -p temp
mkdir -p output
mkdir -p assets/music

# Install Python dependencies
echo "✓ Installing Python packages..."
pip install -r requirements.txt

# Check credentials
echo ""
echo "⚠️  IMPORTANT: Configure your API keys!"
echo ""
echo "1. Edit config.py and set:"
echo "   - TELEGRAM_BOT_TOKEN (from @BotFather)"
echo "   - GEMINI_API_KEY (from Google AI Studio)"
echo ""
echo "2. (Optional) Add background music:"
echo "   - Place MP3 file at: assets/music/background.mp3"
echo ""

# Final checks
echo "✓ Verifying installation..."
python3 -c "import telegram; print('✓ python-telegram-bot installed')"
python3 -c "import google.generativeai; print('✓ google-generativeai installed')"
python3 -c "import yt_dlp; print('✓ yt-dlp installed')"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit config.py with your API keys"
echo "2. Run: python3 telegram_openclaw.py"
echo "3. Send /start to your bot on Telegram"
echo ""
