FROM node:24-slim

RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Копируем зависимости
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь код
COPY . .

# Открываем порт
EXPOSE 3000

# Запускаем dev сервер с правильным хостом
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]