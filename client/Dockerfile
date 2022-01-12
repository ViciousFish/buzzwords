FROM node:16 as build

WORKDIR /build

COPY package.json .

RUN yarn

COPY . .

RUN yarn build