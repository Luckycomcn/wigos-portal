# syntax=docker/dockerfile:1

# ---- Stage 1: build the static bundle ----
FROM node:22-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Optional build-time defaults; runtime config can override these.
ARG VITE_TIANDITU_KEY=
ARG VITE_AMAP_KEY=
ARG VITE_AMAP_SECURITY_JS_CODE=
ARG VITE_AMAP_SERVICE_HOST=
ARG VITE_WIGOS_GOFC_URL=https://wmo-resource-catalogue.labs.wis2dev.io

ENV VITE_TIANDITU_KEY=${VITE_TIANDITU_KEY} \
    VITE_AMAP_KEY=${VITE_AMAP_KEY} \
    VITE_AMAP_SECURITY_JS_CODE=${VITE_AMAP_SECURITY_JS_CODE} \
    VITE_AMAP_SERVICE_HOST=${VITE_AMAP_SERVICE_HOST} \
    VITE_WIGOS_GOFC_URL=${VITE_WIGOS_GOFC_URL}

RUN npm run build

# ---- Stage 2: serve the bundle with Nginx ----
FROM nginx:1.27-alpine AS runtime

RUN rm -rf /usr/share/nginx/html/*
ENV NGINX_ENVSUBST_FILTER=AMAP_SECURITY_JS_CODE
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY deploy/40-wigos-config.sh /docker-entrypoint.d/40-wigos-config.sh
RUN sed -i 's/\r$//' /docker-entrypoint.d/40-wigos-config.sh \
    && chmod +x /docker-entrypoint.d/40-wigos-config.sh
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:8080/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
