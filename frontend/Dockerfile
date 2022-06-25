FROM node:lts as building-stage

WORKDIR /app

COPY package*.json /app/

RUN npm ci

COPY ./ /app/

RUN npm run build

## Testing stage
FROM cypress/included:10.2.0 as testing-stage

WORKDIR /testing
COPY --from=building-stage /app /testing

RUN npm run test

## Create NGINX deployment
FROM nginx:latest

COPY --from=testing-stage /testing/build /usr/share/nginx/html

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
