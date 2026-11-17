# wigos-portal

A demonstration WIGOS metadata portal built with Vue 3, TypeScript, SCSS and OpenLayers. Station search, reports, maps and statistics use the WMO Resource Catalogue. Reference vocabularies are bundled locally; the programme/network affiliation list also refreshes from the WMO register at runtime, retaining the bundled list if the request fails.

> This is an independent demonstration portal. Station queries and exports require access to external services. The legacy local station-list fallback has been removed.

## Features

The application provides four page types:

| Page | Development URL |
| --- | --- |
| Home | http://localhost:5173/#/ |
| Station search | http://localhost:5173/#/search |
| Export | http://localhost:5173/#/export |
| Station report | http://localhost:5173/#/station/report/0-22000-0-2903947 |

Station reports share one template, with the WIGOS identifier changing to match the selected station. Search results and map markers open the corresponding report. Unrecognized routes redirect to the home page.

- **Home:** welcome panel, world map, station markers, legend and catalogue statistics.
- **Search:** keyword and metadata filters, result tables, pagination and map view.
- **Station reports:** station characteristics, observation metadata and report downloads.
- **Export:** generate and download JSON (GeoJSON) result sets and individual JSON records.
- **Maps:** zoom, reset view, select a basemap and inspect station information.
- **Languages:** English, Chinese, French and Spanish. English is the default; untranslated messages fall back to English.
- **Routing:** hash-based URLs, suitable for static hosting without SPA history fallback rules.

XML links open the original WMDR source directly on oscar.wmo.int in a new tab. The catalogue original link will be followed when the archive location changes. JSON (GeoJSON) files are generated from catalogue records.

## Technology

- Vue 3 with TypeScript and `<script setup>`
- Vite with Vue, auto-import and component-resolution plugins
- Vue Router in hash mode
- vue-i18n 11
- OpenLayers
- Element Plus with on-demand component imports
- SCSS compiled by Sass

## Requirements

- Node.js **20.19+ within the 20.x release line, or 22.12+**; development and builds have been verified with Node 24.
- npm **9+**. Use `npm ci` with the committed lockfile to reproduce dependencies.
- Alternatively, use Docker without installing Node.js on the host.

## Project structure

```text
.
├── index.html               # Vite HTML entry point
├── package.json             # Dependencies and scripts
├── package-lock.json        # Locked dependency versions
├── vite.config.ts           # Build settings and development proxies
├── tsconfig*.json           # TypeScript configuration
├── Dockerfile               # Node build stage and Nginx runtime
├── nginx.conf               # Production web server and proxy settings
├── LICENSE                  # Apache License 2.0
├── NOTICE                   # Attribution and third-party resource notices
├── src/
│   ├── api/                 # Catalogue clients and compatibility helpers
│   ├── components/          # Maps, layout and form components
│   ├── data/                # Reference vocabularies and local support data
│   ├── i18n/                # English, Chinese, French and Spanish messages
│   ├── router/              # Hash routes
│   ├── stores/              # Search and export state
│   ├── utils/               # Download and map utilities
│   ├── views/               # The four retained page types
│   └── style.scss           # Independently implemented global styles
├── public/                  # Static assets copied into the build
│   ├── images/              # Retained image assets
│   └── data/                # Geographic data and source information
├── scripts/                 # Delivery build helpers
├── tests/                   # Catalogue and map checks
└── docs/                    # Local documentation (not version-controlled)
```

Generated dependencies, build outputs, local environment files, temporary files and the local `delivery/` and `docs/` directories are excluded from version control. The legacy `web/` prototype and its station snapshot have been removed.

## Local development

```bash
# Install the exact versions recorded in package-lock.json.
npm ci

# Start Vite, normally at http://localhost:5173/.
npm run dev
```

## Production build

```bash
# Run Vue/TypeScript checks and build into dist/.
npm run build

# Preview the build, normally at http://localhost:4173/.
npm run preview
```

The `dist/` directory contains static files. Hash routing does not require SPA history fallback rules. XML source links do not require a proxy.

## Docker deployment

The repository includes a multi-stage `Dockerfile` that installs dependencies, compiles the application and serves the result with Nginx.

```bash
git clone https://github.com/Luckycomcn/wigos-portal.git
cd wigos-portal

docker build -t wigos-portal .
docker run -d --name wigos-portal -p 8080:8080 wigos-portal
```

Open [http://localhost:8080/](http://localhost:8080/). To use a different host port, change the left-hand port mapping, for example `-p 8081:8080`.

Building requires network access to container registries and the npm registry. Runtime data and map services also require network access.

### Automatic packaging from `.env.local` (PowerShell)

From the project directory:

```powershell
# Read and validate map configuration without invoking Docker or writing files.
./scripts/build-delivery.ps1 -Check

# Build a Linux amd64 image, validate Nginx, and export a delivery archive.
./scripts/build-delivery.ps1 -ImageTag wigos-portal:latest

# Also start the container after packaging (default host port 8080).
./scripts/build-delivery.ps1 -ImageTag wigos-portal:latest -Start
```

The script reads `VITE_TIANDITU_KEY`, `VITE_AMAP_KEY` and
`VITE_AMAP_SECURITY_JS_CODE` from `.env.local`; `AMAP_SECURITY_JS_CODE`, when
present, takes precedence for the security code. It passes browser keys at build
time, uses the image's `/_AMapService` proxy, and writes the security code only
to `delivery/runtime.env` for container startup. Keys are not printed. The
security code is not embedded in the image; keep the runtime file private.
Both `.env.local` and `delivery/` are excluded from Git and the Docker context.

Outputs include the image `.tar`, `SHA256SUMS.txt`, `DEPLOYMENT.md`, `runtime.env`,
`LICENSE` and `NOTICE` in `delivery/`. On the target server, import the archive
and follow the generated instructions, including `--env-file runtime.env`.
Use `-EnvFile` to select another environment file, `-Port 8099` to select another
host port, or `-ContainerName another-name` to avoid an existing container.
Existing containers are not replaced automatically. Docker must be running in
Linux containers mode for actual packaging; `-Check` does not require Docker.

## Configuration

1. **Deployment paths**

   Vite uses `base: './'` for relative build asset paths. The favicon references in `index.html` use absolute `/images/*` paths, and map proxy requests use root-relative URLs. Adjust these references and server routing when deploying under a subpath.

2. **Catalogue service**

   The default catalogue host is `https://wmo-resource-catalogue.labs.wis2dev.io`. Set `VITE_WIGOS_GOFC_URL` in a local `.env.local` file to override it, then restart Vite or rebuild.

3. **Original XML and map services**

   Original WMDR XML opens directly using the catalogue's original link, currently on oscar.wmo.int. No XML proxy is needed in Vite or nginx. The OSCAR endpoint will be retired during renewal; future archive URLs should be supplied by the catalogue. nginx retains /_AMapService/ proxies for AMap.

4. **Styles and images**

   Global styles are independently implemented in `src/style.scss`. Vue component styles use SCSS and are compiled by Vite. Original-site stylesheet bundles are no longer loaded. Retained images remain subject to their providers' rights.

5. **Language preferences**

   The default locale is `en`. The selected locale is saved under `oscar-locale` in `localStorage`. Change `DEFAULT_LOCALE` in `src/i18n/index.ts` to change the default.

6. **Local reference data**

   JSON reference files imported from `src/data/` are build inputs and must remain available. Station types, WMO regions, countries/territories and observed-variable options use bundled reference data. The programme/network affiliation filter initially uses a bundled snapshot, then requests the WMO ProgramAffiliation register once per page session (10-second timeout); failed, invalid or incomplete responses retain the snapshot. Station search uses the online catalogue rather than a local station-list fallback.

7. **Map providers**

   OpenStreetMap requires no API key. AMap and Tianditu require provider-specific configuration; see `.env.example`. Values prefixed with `VITE_` are exposed to browser code, so do not place server-only secrets in them. The Docker build accepts `VITE_AMAP_KEY`, `VITE_TIANDITU_KEY` and `VITE_AMAP_SERVICE_HOST` as build arguments.

## FAQ

**Is this an Angular application?**

No. The application uses Vue 3, TypeScript and Vite, with OpenLayers for mapping. Original-site stylesheet bundles and the legacy prototype have been removed.

**Should package.json and package-lock.json be kept?**

Yes. They define the build scripts and dependencies and lock the dependency versions used by `npm ci`.

**What if dependency installation fails on a native package?**

Check that your Node.js version meets the requirements above. If errors involve packages such as `sass-embedded` or `lightningcss`, reinstall dependencies with `npm ci` in a supported environment.

## License and third-party resources

Independently authored project code is licensed under **Apache License 2.0**; see [LICENSE](LICENSE) and [NOTICE](NOTICE).
