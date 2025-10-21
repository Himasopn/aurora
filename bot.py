import os
import tempfile
import subprocess
from pathlib import Path
import telebot
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton

BOT_TOKEN = "😶‍🌫️😶‍🌫️"  # 😶‍🌫️😶‍🌫️  <-- put your bot token here from @BotFather

bot = telebot.TeleBot(BOT_TOKEN, parse_mode=None)

RESOLUTIONS = ["1080", "720", "480", "360", "Audio (mp3)"]

def build_keyboard():
    kb = InlineKeyboardMarkup()
    buttons = []
    for r in RESOLUTIONS:
        buttons.append(InlineKeyboardButton(text=r, callback_data=f"res::{r}"))
    row = []
    for i, b in enumerate(buttons, 1):
        row.append(b)
        if i % 2 == 0:
            kb.row(*row)
            row = []
    if row:
        kb.row(*row)
    return kb

@bot.message_handler(commands=["start", "help"])
def start(message):
    welcome_text = (
        "👋 **Welcome to the YouTube Downloader Bot!**\n\n"
        "🎥 Send me any YouTube link and choose your desired resolution.\n\n"
        "⚠️ Please use this bot only for your own content or with permission.\n\n"
        "Let’s get started — just send the link below!"
    )
    bot.send_message(message.chat.id, welcome_text, parse_mode="Markdown")

@bot.message_handler(func=lambda msg: "youtu" in msg.text)
def handle_link(message):
    chat_id = str(message.chat.id)
    if not hasattr(bot, "user_links"):
        bot.user_links = {}
    bot.user_links[chat_id] = message.text.strip()
    bot.send_message(chat_id, "Please select your preferred resolution:", reply_markup=build_keyboard())

@bot.callback_query_handler(func=lambda call: call.data.startswith("res::"))
def handle_resolution(call):
    chat_id = str(call.message.chat.id)
    res = call.data.split("::", 1)[1]
    if not hasattr(bot, "user_links") or chat_id not in bot.user_links:
        bot.answer_callback_query(call.id, "Send a YouTube link first.")
        return
    url = bot.user_links.pop(chat_id)
    bot.answer_callback_query(call.id, f"Downloading in {res}p...")
    download_and_send(chat_id, url, res)

def download_and_send(chat_id, url, res):
    tmpdir = tempfile.mkdtemp(prefix="ytbot_")
    out_template = str(Path(tmpdir) / "%(title)s.%(ext)s")
    if res == "Audio (mp3)":
        cmd = ["yt-dlp", "-x", "--audio-format", "mp3", "--no-playlist", "-o", out_template, url]
    else:
        fmt = f"bv*[height<={res}]+ba/best[height<={res}]"
        cmd = ["yt-dlp", "-f", fmt, "--merge-output-format", "mp4", "--no-playlist", "-o", out_template, url]
    subprocess.run(cmd, capture_output=True)
    files = list(Path(tmpdir).glob("*"))
    if not files:
        bot.send_message(chat_id, "❌ Download failed.")
        return
    file_path = files[0]
    size = file_path.stat().st_size
    if size > 50 * 1024 * 1024:
        bot.send_message(chat_id, "⚠️ File too large to send on Telegram.")
        return
    with open(file_path, "rb") as f:
        if res == "Audio (mp3)":
            bot.send_audio(chat_id, f, caption=f"🎧 {file_path.name}")
        else:
            bot.send_video(chat_id, f, caption=f"🎬 {file_path.name}")

if __name__ == "__main__":
    print("Bot is running...")
    bot.infinity_polling()
