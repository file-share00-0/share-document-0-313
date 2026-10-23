
FROM node:22-alpine

WORKDIR /app

COPY package.json ./

RUN npm install --omit=dev

COPY server.js index.html ./
COPY build.zip ./

ENV NODE_ENV=production

CMD ["npm", "start"]
