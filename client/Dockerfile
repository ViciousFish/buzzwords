FROM node:20 as build

WORKDIR /build

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/releases/ ./.yarn/releases/
COPY .yarn/plugins ./.yarn/plugins
COPY client/package.json ./client/
COPY shared/package.json ./shared/

RUN yarn

COPY client client

COPY shared shared

RUN cd client && yarn build