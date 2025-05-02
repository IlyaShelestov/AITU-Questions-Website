FROM node:21-alpine

WORKDIR /app

# Копируем package.json и package-lock.json из src/
COPY src/package.json src/package-lock.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь код из src/
COPY src/ .

# Открываем порт 7000
EXPOSE 7000

# Запуск приложения через npm start
CMD ["npm", "start"]
