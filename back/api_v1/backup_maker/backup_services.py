import subprocess
import os
from datetime import datetime
from aiogram.types import FSInputFile

from core import tg_bot

async def send_message_safe(file_path):
    async with tg_bot as bot:
        try:
            file = FSInputFile(
                path=file_path
            )
            await bot.send_document(
                chat_id=-5006628191,
                document=file,
                caption="db backups"
            )
            print("✅ Сообщение отправлено успешно!")
            return "✅ Сообщение отправлено успешно!"
        except Exception as e:
            print(f"❌ Ошибка: {e}")
            return "❌ Ошибка: {e}"


async def make_backup():
    db_host = os.getenv('DB_HOST', 'postgres')
    db_port = os.getenv('DB_PORT', '5432')
    db_name = os.getenv('POSTGRES_DB', 'postgres')
    db_user = os.getenv('POSTGRES_USER', 'postgres')
    db_password = os.getenv('POSTGRES_PASSWORD', 'postgres')

    conn_string = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    dump_file = f"/backups/dump_db_{timestamp}.sql"
    cmd = [
        'pg_dump',
        '-d', conn_string,  # ← строка подключения с паролем
        '-f', dump_file,
        '-v'
    ]
    subprocess.run(cmd)

    return await send_message_safe(dump_file)


