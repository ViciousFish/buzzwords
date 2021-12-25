FROM node:16 AS build

WORKDIR /buzzwords
COPY package.json yarn.lock ./
RUN yarn
COPY . ./
# COPY ../shared ../shared # doesn't work
RUN yarn build

FROM node:16 as RUN

WORKDIR /buzzwords
COPY --from=build /buzzwords/dist /buzzwords

CMD ["node" "dist/server/src/index.js"]