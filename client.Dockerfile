FROM node:16 AS build

WORKDIR /buzzwords
COPY package.json yarn.lock ./
RUN yarn
COPY . ./
RUN yarn build

FROM nginx:1.21

COPY --from=build /buzzwords/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf