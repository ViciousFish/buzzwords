FROM node:16 AS build

WORKDIR /buzzwords
COPY package.json ./
COPY client/package.json client/yarn.lock ./client/
COPY server/package.json server/yarn.lock ./server/
COPY shared/package.json ./shared/
RUN yarn

WORKDIR /buzzwords/shared
COPY shared ./

WORKDIR /buzzwords/server
COPY server ./
RUN yarn build
FROM node:16 as RUN

WORKDIR /buzzwords
COPY package.json ./
COPY client/package.json client/yarn.lock ./client/
COPY server/package.json server/yarn.lock ./server/
COPY shared/package.json ./shared/
RUN yarn --production
COPY --from=build /buzzwords/server/dist ./server/dist
RUN ls server

RUN ls shared;

CMD ["node" "index.js"]