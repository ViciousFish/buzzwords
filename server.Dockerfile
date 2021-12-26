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

CMD ["node" "/buzzwords/server/dist/server/src/index.js"]