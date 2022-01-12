FROM node:16

WORKDIR /buzzwords

COPY package.json yarn.lock ./
# COPY ./client/package.json ./client/
COPY ./server/package.json ./server/
COPY ./shared/package.json ./shared/

RUN yarn

COPY . .

RUN cd server && yarn build

# FROM node:16-slim as app

# WORKDIR /buzzwords

# COPY ./server/package.json ./

ENV NODE_ENV=production

# RUN yarn

# COPY ./server/words.json .

# COPY --from=build /build/server/dist ./dist

CMD ["node", "/buzzwords/dist/index.js"]