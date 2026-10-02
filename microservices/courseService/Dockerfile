FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update \
	&& apt-get install -y --no-install-recommends openssl \
	&& rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

ENV NODE_ENV=production
EXPOSE 5001

CMD ["sh", "-c", "for attempt in $(seq 1 30); do npx prisma migrate deploy && npm start && exit 0; echo \"Database not ready (attempt $attempt/30); retrying...\"; sleep 5; done; exit 1"]