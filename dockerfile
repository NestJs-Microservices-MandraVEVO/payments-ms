#instrucciones para crear la aplicacion como una imagen

FROM node:22-alpine 

WORKDIR /usr/src/app

COPY package*.json ./


RUN yarn install

COPY . .

EXPOSE 3006