FROM node:10-alpine as front-builder

ARG VERSION
WORKDIR /app
COPY . .
RUN npm version $VERSION
RUN apk add yarn --update
RUN yarn install && yarn run build
FROM nginx:alpine

COPY --from=front-builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
