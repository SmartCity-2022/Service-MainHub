FROM node:lts as build-stage

WORKDIR /app

COPY package*.json /app/

RUN npm ci

COPY ./ /app/

#Create NODE deployment
FROM node:lts

WORKDIR /app

COPY --from=build-stage /app /app

ENV NODE_ENV=production

CMD node server.js

EXPOSE 80