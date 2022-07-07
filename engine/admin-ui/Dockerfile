FROM node:lts-slim as builder

WORKDIR /app
COPY package.json yarn.lock .yarnrc ./
RUN yarn install
COPY . .
RUN yarn run build


FROM nginx:stable-alpine

COPY --from=builder --chown=nginx:0 /app/build/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# implement changes required to run NGINX as an unprivileged user
RUN sed -i '/user  nginx;/d' /etc/nginx/nginx.conf \
  && sed -i 's,/var/run/nginx.pid,/tmp/nginx.pid,' /etc/nginx/nginx.conf \
  && sed -i "/^http {/a \    proxy_temp_path /tmp/proxy_temp;\n    client_body_temp_path /tmp/client_temp;\n    fastcgi_temp_path /tmp/fastcgi_temp;\n    uwsgi_temp_path /tmp/uwsgi_temp;\n    scgi_temp_path /tmp/scgi_temp;\n" /etc/nginx/nginx.conf \
  # nginx user must own the cache and etc directory to write cache and tweak the nginx config
  && chown -R 101:0 /var/cache/nginx \
  && chmod -R g+w /var/cache/nginx \
  && chown -R 101:0 /etc/nginx \
  && chmod -R g+w /etc/nginx

USER nginx
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
