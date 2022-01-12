FROM node:16 as build

WORKDIR /build

COPY package.json yarn.lock ./
# COPY ./client/package.json ./client/
COPY ./server/package.json ./server/
COPY ./shared/package.json ./shared/

RUN yarn

COPY . .

RUN cd server && yarn build

FROM node:16-slim as app

WORKDIR /buzzwords

COPY ./server/package.json ./

ENV NODE_ENV=production

RUN yarn

COPY ./server/words.json .

COPY --from=build /build/server/dist ./dist
# RUN ls
CMD ["node", "/buzzwords/dist/index.js"]