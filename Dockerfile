FROM node:16 as build

WORKDIR /build

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/releases/ ./.yarn/releases/
COPY ./server/package.json ./server/
COPY ./shared/package.json ./shared/

RUN yarn

COPY . .

WORKDIR /build/server

# RUN yarn

RUN yarn build

FROM node:16-slim as app

WORKDIR /buzzwords

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/releases/ ./.yarn/releases/

WORKDIR /buzzwords/server

COPY ./server/package.json ./

ENV NODE_ENV=production

RUN yarn install

COPY ./server/words.json .

COPY --from=build /build/server/dist ./dist

CMD ["node", "/buzzwords/server/dist/index.js"]