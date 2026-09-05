FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

EXPOSE 5000

HEALTHCHECK --interval=10s --timeout=3s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

CMD ["node", "server.js"]
