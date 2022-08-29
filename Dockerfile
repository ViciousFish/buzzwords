FROM node:16 as build

WORKDIR /build

COPY package.json yarn.lock ./
COPY ./server/package.json ./server/
COPY ./shared/package.json ./shared/

RUN yarn install

COPY . .

RUN cd server && yarn build

FROM node:16-slim as app

WORKDIR /buzzwords

COPY ./server/package.json ./

ENV NODE_ENV=production

RUN yarn install

COPY ./server/words.json .

COPY --from=build /build/server/dist ./dist

CMD ["node", "/buzzwords/dist/index.js"]