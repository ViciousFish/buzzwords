FROM node:16 AS build

WORKDIR /buzzwords
COPY package.json ./
COPY server/package.json server/yarn.lock ./server/
COPY shared/package.json ./shared/
RUN yarn

WORKDIR /buzzwords/shared
COPY shared ./

WORKDIR /buzzwords/server
COPY server ./
RUN yarn build

FROM node:16

WORKDIR /buzzwords
COPY package.json ./
COPY server/package.json server/yarn.lock ./server/
COPY shared/package.json ./shared/
RUN yarn install --production

COPY --from=build /buzzwords/server/dist ./server/dist/

CMD ["node", "/buzzwords/server/dist/server/src/index.js"]