FROM node:22

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

CMD ["node", "dist/server.js"]
