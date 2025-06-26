FROM node:22

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev --force

CMD ["node", "dist/frontend/server/main.js"]
