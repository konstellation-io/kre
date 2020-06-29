FROM node:14 as front-builder

ARG VERSION
WORKDIR /app
COPY package.* ./
COPY yarn* ./
RUN yarn install
RUN npm version $VERSION
COPY . .
RUN yarn run build
FROM nginx:alpine

COPY --from=front-builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
