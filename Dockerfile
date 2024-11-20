#######################
# WARNING
# Do not ever publicly publish an image
# with a GOOGLE_CREDS build arg.
# Doing this is necessary for DO app platform,
# which has its own secret image registry and no
# other mechanism for supplying secrets as a file.
#######################
FROM node:20 as build

WORKDIR /build

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/releases/ ./.yarn/releases/
COPY ./server/package.json ./server/
COPY ./shared/package.json ./shared/

RUN yarn

COPY . .

WORKDIR /build/server

# RUN yarn

RUN yarn build

FROM node:20-slim as app

WORKDIR /buzzwords

COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/releases/ ./.yarn/releases/

WORKDIR /buzzwords/server

COPY ./server/package.json ./

ENV NODE_ENV=production

RUN yarn install

COPY ./server/words.json .

COPY --from=build /build/server/dist ./dist

ARG GOOGLE_CREDS
RUN echo $GOOGLE_CREDS | base64 --decode > ./google-credentials.json
ENV GOOGLE_APPLICATION_CREDENTIALS=/buzzwords/server/google-credentials.json

CMD ["node", "/buzzwords/server/dist/index.js"]