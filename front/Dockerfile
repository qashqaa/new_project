FROM node:24-alpine

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