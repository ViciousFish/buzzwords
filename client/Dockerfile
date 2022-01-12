FROM node:16 as build

WORKDIR /build

COPY package.json yarn.lock ./

RUN yarn

COPY client client

COPY shared shared

RUN cd client && yarn build