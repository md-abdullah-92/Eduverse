FROM node:20-bookworm-slim AS dependencies

WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:20-bookworm-slim AS builder

WORKDIR /app
ENV DOCKER_BUILD=true
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build -- --no-lint

FROM node:20-bookworm-slim AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]