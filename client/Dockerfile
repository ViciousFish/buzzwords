FROM node:16.14.2 as build

WORKDIR /build

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/releases/ ./.yarn/releases/
COPY client/package.json ./client/
COPY shared/package.json ./shared/

RUN yarn

COPY client client

COPY shared shared

RUN cd client && yarn build