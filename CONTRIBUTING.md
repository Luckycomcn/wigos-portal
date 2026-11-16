# Contributing to WIGOS Portal

Bug reports, documentation improvements and pull requests are welcome. Follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Reporting issues

Search existing GitHub issues first. Include reproduction steps, expected and actual behaviour, browser and operating system, and relevant WIGOS identifiers. Remove credentials and personal information from logs. Report vulnerabilities according to [SECURITY.md](SECURITY.md).

## Development

Use Node.js compatible with the installed Vite version (see package-lock.json). Run:

```sh
npm ci
npm run dev
```

Create a branch from the default branch and keep each pull request focused. Follow the existing Vue 3 and TypeScript conventions. Update documentation and translations when behaviour changes. Do not commit secrets, build output or editor configuration.

Before submitting, run:

```sh
npm run build
node --experimental-vm-modules tests/catalogue.test.mjs
node tests/mapHover.test.mjs
node tests/mapCloud.test.mjs
node tests/stationOverview.test.mjs
node tests/stationOverviewMode.test.mjs
```

Describe the problem, changes, validation and any limitations in the pull request. Contributions are provided under the project's [Apache-2.0 license](LICENSE).
