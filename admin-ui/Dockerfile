FROM node:10-alpine as front-builder

ARG VERSION
WORKDIR /app
COPY . .
RUN npm version $VERSION
RUN npm ci && npm audit fix && npm run build
FROM nginx:alpine

COPY --from=front-builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
