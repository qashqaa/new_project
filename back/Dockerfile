FROM python:3.13.10-slim

RUN apt-get update && apt-get install -y \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Копируем зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем код
COPY . .

# Запускаем через uvicorn
# CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port 8000"]


CMD ["sh", "-c", " \
  echo 'Запускаем миграции...' && \
  alembic upgrade head && \
  echo 'Миграции выполнены. Запускаем сервер...' && \
  uvicorn main:app --host 0.0.0.0 --port 8000 \
"]