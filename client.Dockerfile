FROM node:16 AS build

WORKDIR /buzzwords
COPY package.json ./
COPY client/package.json client/yarn.lock ./client/
COPY server/package.json server/yarn.lock ./server/
COPY shared/package.json ./shared/
RUN yarn

WORKDIR /buzzwords/client
COPY client ./
RUN yarn vite build

FROM nginx:1.21

COPY --from=build /buzzwords/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf