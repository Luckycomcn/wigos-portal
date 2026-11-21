# Docker Deployment

The default world basemap does not require an API key. Tianditu and AMap require your own keys.

## Build and Run from Source

```sh
cp deploy.env.example deploy.env
# Edit deploy.env to configure the map services
docker compose --env-file deploy.env up -d --build
```

Open http://localhost/ . The container listens on port 8080, which is mapped to host port 80 by default.

## Use a Locally Built Bundle

Use Node.js 22.12+ or 24:

```sh
npm ci
npm run build
docker compose --env-file deploy.env -f docker-compose.dist.yml up -d --build
```

`Dockerfile.dist.dockerignore` allows the `dist` directory to be copied into the image. Source builds still exclude any existing `dist` directory.

## Runtime Configuration

The container startup script, `deploy/40-wigos-config.sh`, generates `/config.js` from environment variables. It supports
`TIANDITU_KEY`, `AMAP_KEY`, `AMAP_SECURITY_JS_CODE`, `AMAP_SERVICE_HOST`, and `WIGOS_GOFC_URL`.
Non-empty runtime values take precedence over build-time `VITE_*` settings, so changing the catalogue service or keys does not require rebuilding the application.
Local development reads `VITE_*` settings from `.env.local`, which is ignored by Git.
Configuration used by the browser is visible to visitors.

To use AMap proxy mode, set `AMAP_SERVICE_HOST=/_AMapService` and provide `AMAP_SECURITY_JS_CODE`.
The browser must be able to reach the external map and catalogue services.

```sh
docker compose --env-file deploy.env ps
docker compose --env-file deploy.env logs wigos-portal
curl -I http://127.0.0.1/
```

If port 80 is already in use, change the port mapping in the Compose file, for example to `8081:8080`.
