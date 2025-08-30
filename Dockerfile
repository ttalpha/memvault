FROM node:latest AS builder

WORKDIR /app

COPY package.json yarn.lock ./

COPY cache ./cache
COPY utils ./utils

RUN yarn install --frozen-lockfile

RUN yarn workspace memvault-utils build
RUN yarn workspace cache build

# --- production image ---
FROM node:alpine

WORKDIR /app

COPY --from=builder /app/package.json /app/yarn.lock ./
COPY --from=builder /app/cache/package.json ./cache/
COPY --from=builder /app/utils/package.json ./utils/

ENV NODE_ENV=production
RUN yarn install --frozen-lockfile --production

COPY --from=builder /app/utils/dist ./utils/dist
COPY --from=builder /app/cache/dist ./cache/dist

EXPOSE 6379
CMD ["yarn", "workspace", "cache", "start"]
