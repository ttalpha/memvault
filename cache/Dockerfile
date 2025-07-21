FROM node:latest AS builder

WORKDIR /app
COPY package.json .
COPY yarn.lock .

RUN yarn
COPY . .

RUN yarn build

FROM node:alpine
WORKDIR /app

COPY package.json .
COPY yarn.lock .

ENV NODE_ENV=production
RUN yarn

COPY --from=builder /app/dist/ ./dist/

EXPOSE 6379

CMD [ "yarn", "start" ]
