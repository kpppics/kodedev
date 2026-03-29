# 🎬 OpenClaw AI Video Generation System

A fully automated AI-powered short-form video generation system for TikTok, YouTube Shorts, Instagram Reels, and more.

## 🎯 Features

✅ **AI-Powered Planning** - Uses Gemini Flash to understand video concepts and create professional scripts
✅ **Automatic Clip Fetching** - Downloads relevant video clips using yt-dlp
✅ **Professional Video Composition** - FFmpeg-based rendering with zoom effects and captions
✅ **Vertical Format** - Optimized 1080x1920 resolution for social media
✅ **Background Music** - Auto-mixing of background music tracks
✅ **Telegram Integration** - Full bot interface for generating videos on demand
✅ **AutoPost System** - Generate trending content automatically
✅ **Production-Ready** - Zero manual intervention, fully automated pipeline

## 📁 Project Structure

```
video_system/
├── telegram_openclaw.py      # Main Telegram bot
├── autopost.py               # Automated video generation
├── config.py                 # Configuration & credentials
├── ai_director.py            # AI video planning (Gemini)
├── clip_engine.py            # Video clip downloading (yt-dlp)
├── video_engine.py           # Video composition (FFmpeg)
├── requirements.txt          # Python dependencies
├── temp/                     # Temporary files
├── output/                   # Generated videos
└── assets/
    └── music/                # Background music files
```

## 🚀 Quick Start

### 1. Prerequisites

Install system dependencies:

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y ffmpeg python3 python3-pip

# Verify installations
ffmpeg -version
python3 --version
pip3 --version
```

### 2. Install Python Dependencies

```bash
cd video_system
pip install -r requirements.txt
```

### 3. Configure Credentials

Edit `config.py` and set your API keys:

```python
# Get from https://cloud.google.com/docs/authentication/application-default-credentials
GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE"

# Get from @BotFather on Telegram
TELEGRAM_BOT_TOKEN = "YOUR_TELEGRAM_BOT_TOKEN_HERE"
```

### 4. Add Background Music (Optional)

Place background music file at:
```
video_system/assets/music/background.mp3
```

The system will work without music, but including it creates better videos.

### 5. Run the Bot

```bash
python3 telegram_openclaw.py
```

The bot will start and wait for commands on Telegram.

## 🎮 Telegram Bot Commands

### `/makevideo <prompt>`
Generate a video from your description.

**Example:**
```
/makevideo make a dirty room to clean room timelapse video with cleaners
```

**What happens:**
1. AI analyzes your prompt
2. Creates a video script with hooks and captions
3. Searches for relevant clips
4. Downloads clips automatically
5. Composes into 1080x1920 vertical video
6. Adds zoom effects and captions
7. Sends final video via Telegram

### `/autopost`
Generate a trending video idea automatically.

**What happens:**
1. AI generates a trending video concept
2. Plans the video structure
3. Downloads clips
4. Creates and sends the video

### `/status`
Check system status.

### `/help`
Show help message.

## 🤖 AutoPost - Batch Generation

Generate multiple videos automatically:

```bash
# Generate 1 video (with random idea)
python3 autopost.py

# Generate 5 videos in a batch
python3 autopost.py --batch 5

# Generate with a custom prompt
python3 autopost.py --prompt "make a satisfying slime video"
```

Videos are saved to `output/` directory.

## 🔧 Configuration

All settings are in `config.py`:

```python
# Video format
VIDEO_WIDTH = 1080          # Width in pixels
VIDEO_HEIGHT = 1920         # Height in pixels (vertical)
VIDEO_FPS = 30              # Frames per second
VIDEO_CRF = 18              # Quality (lower = better)
VIDEO_DURATION = 15         # Default duration in seconds

# Clip downloading
MAX_CLIPS = 4               # Number of clips to fetch
CLIP_DOWNLOAD_TIMEOUT = 60  # Timeout in seconds
CLIP_MAX_SIZE_MB = 50       # Max file size per clip

# Processing
FFMPEG_TIMEOUT = 600        # 10 minutes timeout
FFMPEG_PRESET = "medium"    # Quality: fast, medium, slow

# Telegram
TELEGRAM_TIMEOUT = 30       # Timeout for API calls
MAX_VIDEO_SIZE_MB = 50      # Max upload size to Telegram
```

## 🧠 How It Works

### 1. **AI Director** (ai_director.py)

Uses Google's Gemini Flash model to:
- Analyze user prompts
- Generate video structure (hook, main, ending)
- Create captions and scripts
- Suggest search keywords
- Determine pacing and music style

Output: Structured JSON with complete video plan

### 2. **Clip Engine** (clip_engine.py)

Downloads video clips using yt-dlp:
- Searches for relevant clips
- Downloads to `temp/` directory
- Limits file sizes for speed
- Handles timeouts gracefully

Output: List of video clip files

### 3. **Video Engine** (video_engine.py)

Composes videos using FFmpeg:
- Scales clips to vertical format (1080x1920)
- Applies zoom effect (zoompan filter)
- Adds captions with timing
- Mixes background music
- Encodes to H.264

Output: Final MP4 video

### 4. **Telegram Bot** (telegram_openclaw.py)

Orchestrates the pipeline:
- Accepts user commands
- Runs all engines
- Sends videos to user
- Shows progress updates
- Handles errors gracefully

## 📊 Example Video Pipeline

**Input:**
```
/makevideo make a satisfying cleaning video timelapse
```

**AI Director Output:**
```json
{
  "hook": "Watch this transformation",
  "main": "From messy to clean in seconds",
  "ending": "Satisfying right?",
  "scenes": ["dirty_room", "cleaning", "clean_room", "final"],
  "keywords": ["room cleaning", "timelapse", "before after", "satisfying"],
  "style": "satisfying",
  "pacing": "fast",
  "music_type": "energetic",
  "duration_seconds": 15
}
```

**Clip Engine Output:**
```
Downloading: room_cleaning_timelapse.mp4 (32MB)
Downloading: satisfying_cleaning.mp4 (28MB)
Downloading: before_after_room.mp4 (25MB)
Downloading: cleaning_montage.mp4 (19MB)
```

**Video Engine Output:**
```
Creating 1080x1920 vertical video
Applying zoom effects
Adding captions:
  0-2s: "Watch this transformation"
  2-6s: "From messy to clean in seconds"
  9-11s: "Satisfying right?"
Mixing background music
Final video: final.mp4 (8.5MB)
```

**Result:** Professional short-form video ready for TikTok!

## 🐛 Troubleshooting

### "No clips downloaded"
- Check internet connection
- yt-dlp might be rate-limited, wait a few minutes
- Verify ffmpeg is installed: `ffmpeg -version`

### "FFmpeg timeout"
- Check disk space
- Increase `FFMPEG_TIMEOUT` in config.py
- Try with fewer/smaller clips

### "Telegram bot not responding"
- Verify bot token is correct in config.py
- Check bot is running: `python3 telegram_openclaw.py`
- Verify internet connection

### "Gemini API error"
- Check API key is correct
- Verify API is enabled in Google Cloud Console
- Check rate limits

### "Video quality is poor"
- Increase `VIDEO_CRF` value (lower = better, but slower)
- Change `FFMPEG_PRESET` to "slow"
- Use higher quality source clips

## 📈 Performance Tips

1. **Faster Processing:**
   - Lower `VIDEO_CRF` (use 23-28 instead of 18)
   - Change `FFMPEG_PRESET` to "fast"
   - Reduce `MAX_CLIPS` to 3

2. **Better Quality:**
   - Increase `VIDEO_CRF` lower values (use 18, 20)
   - Change `FFMPEG_PRESET` to "slow"
   - Include high-quality background music

3. **Smaller File Sizes:**
   - Lower `VIDEO_FPS` to 24
   - Increase `VIDEO_CRF` (use 24-28)
   - Limit audio bitrate in config

## 🔒 Security Notes

- Store API keys securely, never commit to git
- Use environment variables for production:
  ```python
  import os
  GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
  TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")
  ```
- Limit bot access in Telegram privacy settings
- Monitor API usage to avoid unexpected charges

## 📚 API Key Setup

### Google Gemini API

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Click "Get API Key"
3. Create new API key
4. Copy key to `config.py`

### Telegram Bot Token

1. Open Telegram and find [@BotFather](https://t.me/botfather)
2. Send `/newbot`
3. Choose a name and username
4. Copy the token
5. Paste into `config.py`

## 🎬 Creating Professional Videos

**Tips for Best Results:**

1. **Be Specific in Prompts:**
   ✅ "Make a timelapse video of a messy room being cleaned by multiple people"
   ❌ "Make a video"

2. **Include Details:**
   - What transformation?
   - What mood/style?
   - Fast or slow pacing?
   - What music style?

3. **Good Prompts:**
   - Cleaning/organizing transformations
   - Before/after makeovers
   - Food cooking timelapse
   - Building/DIY projects
   - Nature/animal videos
   - Satisfying/oddly relaxing content

## 📝 Logging

Logs are output to console with timestamp, level, and module name.

To save logs to file:

```python
# In telegram_openclaw.py or autopost.py
logging.basicConfig(
    level=logging.INFO,
    format=LOG_FORMAT,
    handlers=[
        logging.FileHandler("video_system.log"),
        logging.StreamHandler()
    ]
)
```

## 🚀 Deployment

### Docker (Optional)

```dockerfile
FROM python:3.10

WORKDIR /app
RUN apt-get update && apt-get install -y ffmpeg yt-dlp
COPY video_system/ .
RUN pip install -r requirements.txt

CMD ["python3", "telegram_openclaw.py"]
```

### Linux Service (systemd)

Create `/etc/systemd/system/openclaw.service`:

```ini
[Unit]
Description=OpenClaw Video Bot
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/video_system
ExecStart=/usr/bin/python3 telegram_openclaw.py
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl enable openclaw
sudo systemctl start openclaw
sudo systemctl status openclaw
```

## 📄 License

Built for automated content creation. Use responsibly.

## 🤝 Support

For issues or questions, check:
- Logs: `python3 telegram_openclaw.py 2>&1 | tee output.log`
- Requirements: `pip install --upgrade -r requirements.txt`
- System: `ffmpeg -version && python3 --version`

---

**Made with ❤️ by OpenClaw**
