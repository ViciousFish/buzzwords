FROM node:16-alpine

WORKDIR /buzzwords
COPY ./dist ./

RUN echo $GOOGLE_CREDS > ./google-credentials.json
ENV GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json

CMD ["node", "/buzzwords/index.js"]