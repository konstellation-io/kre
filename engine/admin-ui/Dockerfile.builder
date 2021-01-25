FROM node:14

WORKDIR /app
COPY package.* ./
COPY yarn* ./
RUN yarn install
COPY . .
RUN yarn run build
