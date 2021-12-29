# FROM node:16 AS build

# WORKDIR /buzzwords
# COPY client/package.json client/yarn.lock ./client/

# WORKDIR /buzzwords/shared
# COPY ./shared ./

# WORKDIR /buzzwords/client
# RUN yarn
# COPY ./client ./
# RUN yarn build


FROM nginx:1.21

COPY ./client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf