import os
from aiogram import Bot

bot_token = os.getenv("BOT_TOKEN")

tg_bot = None
if bot_token != "TOKEN":
    tg_bot = Bot(token=bot_token)