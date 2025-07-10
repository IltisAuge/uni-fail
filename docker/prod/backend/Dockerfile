FROM node:22

WORKDIR /uni-fail/app

COPY package.json ./
RUN npm install --omit=dev

CMD ["node", "dist/server.js"]
