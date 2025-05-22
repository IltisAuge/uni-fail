FROM node:22

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
RUN npm install --omit=dev

CMD ["node", "dist/uni-fail/server/main.js"]