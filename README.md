# data-monitor

[![CI data-monitor](https://github.com/piopon/data-monitor/actions/workflows/ci-data-monitor.yml/badge.svg?branch=main)](https://github.com/piopon/data-monitor/actions/workflows/ci-data-monitor.yml)
[![CD data-monitor](https://github.com/piopon/data-monitor/actions/workflows/cd-data-monitor.yml/badge.svg)](https://github.com/piopon/data-monitor/actions/workflows/cd-data-monitor.yml)
[![License](https://img.shields.io/github/license/piopon/data-monitor)](LICENSE)
[![GitHub release](https://img.shields.io/github/v/release/piopon/data-monitor)](https://github.com/piopon/data-monitor/releases)
[![Coverage](https://img.shields.io/badge/coverage-83.98%25-yellowgreen)](coverage/lcov-report/index.html)

Data Monitor is a Next.js application for tracking external data sources (for example data from the [scraper backend service](https://github.com/piopon/web-scraper)), defining threshold-based monitors, and sending notifications when configured conditions are met.

The project combines:

- data retrieval through backend API routes
- monitor configuration and threshold checks
- notifier integrations (for example Discord and email)
- a background worker for periodic checks
- PostgreSQL persistence and encrypted storage of sensitive fields

This repository is prepared for both local development and self-hosted deployments, including GitHub CI/CD workflows and Docker Compose runtime setup.

> [!TIP]
> Although it's explicitly stated that the scraper service is used as the data provider, this application can use any REST API server as its backend.
> The only requirement is that the JSON structure must match the one described in the scraper documentation.
> For more information check [this sample JSON file](https://github.com/piopon/web-scraper/blob/main/docs/json/data.json)

## Docker self-host runbook 🐳

This repository includes a production-oriented Docker setup for self-hosted deployments.
The compose stack starts these containers:

- `postgres`: application database
- `web`: Next.js production server
- `worker`: background monitor/notifier process
- `init`: DB initialization process

### Quick start ⚡

Create `.env` in the repository root with the following sample values:

```env
# ------------------------------------------------- CONNECTION PARAMETERS
SERVER_URL=localhost                                # service address
SERVER_PORT=3000                                    # service port number

# ------------------------------------------------- MONITOR SERVICE
INIT_ON_START=true                                  # should DB init be done on service start

# ------------------------------------------------- BACKEND SCRAPER SERVICE
NEXT_PUBLIC_SCRAPER_URL=                            # URL used in scraper link menu button
SCRAPER_HOST=localhost                              # scraper IP address for internal communication
SCRAPER_PORT=5000                                   # scraper port number for internal communication
SCRAPER_URL_LOGIN=/auth/token                       # endpoint for scraper login
SCRAPER_URL_LOGOUT=/auth/logout                     # endpoint for scraper logout
SCRAPER_URL_DATA=/api/v1/data                       # endpoint for retrieving all scraper data
SCRAPER_URL_ITEMS=/api/v1/data/items                # endpoint for retrieving scraper data items
SCRAPER_URL_EDIT=?challenge=                        # endpoint for scraper edit menu
SCRAPER_URL_FEATURES=/api/v1/settings/features      # endpoint for retrieving scraper feature list

# ------------------------------------------------- DATABASE SERVICE
DB_USER=                                            # database user (authentication)
DB_PASS=                                            # database password (authentication)
DB_HOST=localhost                                   # the IP address for database
DB_PORT=5432                                        # the port for database connection
DB_NAME=data-monitor                                # the name of the database

# ------------------------------------------------- CRYPTOGRAPHY
CRYPTO_SECRET=                                      # primary secret for AES-256-GCM encryption/decryption
CRYPTO_LEGACY_SECRETS=                              # comma-separated list of previous secrets (rotation)
CRYPTO_MIGRATE_ON_INIT=false                        # should plain sensitive data be encrypted at init
CRYPTO_REENCRYPT_ON_INIT=false                      # should re-encryption be invoked at init

# ------------------------------------------------- DATA CHECK SETTINGS
CHECK_INTERVAL=60000                                # monitor worker runtime interval (ms)
CHECK_DELAY=5000                                    # worker's delay for service alive check (ms)
CHECK_WAIT=1000                                     # worker's service alive check interval (ms)
CHECK_NOTIFY=3600000                                # global notify timeframe window (ms)
CHECK_MONITOR_CONCURRENCY=5                         # number of concurrently running monitors

# ------------------------------------------------- NOTIFIERS SETTINGS
NOTIFIER_DISCORD_AVATAR=                            # Discord notifier bot avatar

# ------------------------------------------------- RETRY FETCHING SETTINGS
REQUEST_TIMEOUT=8000                                # Default timeout for retrying requests (ms)
REQUEST_RETRIES=2                                   # Number of request retries
REQUEST_RETRY_DELAY=250                             # Delay time between request retries (ms)
```

`INIT_ON_START=true` in this sample is mainly for local non-Docker development convenience.
When running through Docker Compose, web service forces `INIT_ON_START=false` and relies on the dedicated `init` container.

> [!IMPORTANT]
> Remember to **add ALL user/password/secret keys** and <ins>don't share them with anyone</ins>.
> Also fill notifier section based on your needs.

Then start the stack:

```bash
docker compose up --build -d
```

Useful commands:

```bash
# Check all containers
docker compose ps

# Follow web logs
docker compose logs -f web

# Follow worker logs
docker compose logs -f worker
```

### Container log retention

This project configures Docker log rotation directly in docker-compose.yml for all services (postgres, web, worker, init).

Current policy:

- log driver: json-file
- max-size: 10m
- max-file: 5

Per-service retained log size is approximately 50 MB (10 MB x 5 files).
This prevents unbounded log growth on long-running self-hosted machines.

Operational checks:

- docker compose ps
- docker compose logs -f web
- docker compose logs -f worker
- docker system df

### Backend API endpoints 🌐

Base URL: `http://localhost:3000`

This is a short endpoint map for operators and integrations. It intentionally focuses on URL purpose and HTTP methods only.

| Endpoint | Methods | Purpose |
| --- | --- | --- |
| `/api/health` | `GET`, `HEAD` | Service liveness probe for Docker and external monitors. |
| `/api/init` | `GET` | Initialize database tables and load scraper feature metadata. |
| `/api/user` | `GET`, `POST`, `PUT`, `DELETE` | User configuration CRUD. |
| `/api/monitor` | `GET`, `POST`, `PUT`, `DELETE` | Monitor configuration CRUD for authorized user. |
| `/api/notifier` | `GET`, `POST`, `PUT`, `DELETE` | Notifier configuration CRUD for authorized user, and notifier test-send mode via `POST ?type=...`. |
| `/api/scraper/login` | `POST` | Proxy login request to scraper backend. |
| `/api/scraper/logout` | `POST` | Proxy logout request to scraper backend. |
| `/api/scraper/data` | `GET` | Proxy full data payload from scraper backend. |
| `/api/scraper/items` | `GET` | Proxy filtered item list from scraper backend (`?name=...` optional). |

Notes:

- `monitor` and `notifier` routes are user-scoped and require an authorized user context.
- Scraper proxy routes pass through to the configured scraper endpoints from environment/app config.

By default, web app is exposed on `http://localhost:3000`.

### Dev mode vs Docker mode 💻

Use one of the two run modes depending on your goal.

- Dev mode (`npm run dev`): best for local coding with hot reload and fast iteration. In this mode you can set `INIT_ON_START=true` in local `.env` so the home route can trigger `/api/init` automatically.
- Docker mode (`docker compose up`): best for self-hosting and production-like validation. In this mode startup bootstrap is handled by the `init` service and worker waits for successful init.

Important behavior note:

- In Docker Compose, `INIT_ON_START` is forced to `false` for the `web` service, so root-page init is disabled there by design.
- In local non-Docker runs, `INIT_ON_START` can be enabled when you want convenient auto-init during development.

### OpenAPI and Swagger docs 📘

The API contract is maintained as OpenAPI 3.1 and treated as the source of truth.

- Interactive docs (read-only): `http://localhost:3000/api/docs`
- Raw bundled OpenAPI JSON: `http://localhost:3000/api/docs/openapi.json`

The docs UI is intentionally configured in read-only mode (`try it out` disabled by default).

### OpenAPI maintenance workflow 🧭

When API behavior changes, update OpenAPI files in the same PR whenever possible.

Recommended sequence:

1. Update contract files under `openapi/`.
2. Update route implementation under `src/app/api/`.
3. Validate contract locally:

```bash
npm run openapi:validate
```

CI behavior:

- `Lint, Build, Test` is the required quality job.
- `API/OpenAPI Advisory` is a visible non-blocking job.
- The advisory job warns when API route files change without matching `openapi/` updates.
- Add PR label `api-guard-skip` to explicitly acknowledge and skip that advisory guard.

## Sensitive data encryption key 🔐

To encrypt database fields containing secrets, configure this environment variable before running the app:

```bash
CRYPTO_SECRET=<long-random-secret-value>
```

Use a long, random value and keep it private. The application derives the encryption key for sensitive model fields from this value.
Losing this secret results in irreversible loss of access to encrypted data, so keep a secure backup.

### Optional migration and rotation flags 🔏

```bash
# Run plaintext -> encrypted migration on init (default: false)
CRYPTO_MIGRATE_ON_INIT=true

# Re-encrypt already encrypted values with current CRYPTO_SECRET on init (default: false)
CRYPTO_REENCRYPT_ON_INIT=false

# Legacy secrets accepted for decryption during rotation (optional)
# Supported formats:
# 1) comma-separated string
CRYPTO_LEGACY_SECRETS=old-secret-1,old-secret-2
# 2) JSON array
CRYPTO_LEGACY_SECRETS=["old-secret-1","old-secret-2"]
```

### Secret rotation runbook 📑

1. Generate a new long random secret and set it as `CRYPTO_SECRET`.
2. Put previous secret values in `CRYPTO_LEGACY_SECRETS`.
3. Ensure `CRYPTO_MIGRATE_ON_INIT=true` and set `CRYPTO_REENCRYPT_ON_INIT=true`.
4. Start the app and trigger `GET /api/init` once.
5. Wait for successful init and migration logs.
6. Set `CRYPTO_REENCRYPT_ON_INIT=false` and remove old values from `CRYPTO_LEGACY_SECRETS`.
7. Restart the app and verify normal reads/writes.

> [!IMPORTANT]
> Keep legacy secrets configured until all encrypted rows are re-encrypted and all running instances use the new active secret.

## Release runbook 📝

Use this runbook when publishing and deploying a release.

Version metadata behavior in release bundles:

- CD generates a root `VERSION` file during release workflow execution.
- The value format is `<package.json version>+<12-char commit sha>`.
- The file is included in the release archive and in Docker runtime image.

1. Ensure CI is green for the target commit/PR.
2. Create a GitHub release (tag + publish).
3. Wait for `CD data-monitor` workflow to finish successfully.
4. Download the generated archive from the release assets.
5. Extract the archive on the target host.
6. Prepare `.env` with production values.
7. Start services using Docker Compose:

```bash
docker compose up --build -d
```

8. Verify startup state:

```bash
docker compose ps
docker compose logs -f init
docker compose logs -f web
docker compose logs -f worker
```

9. Validate application availability in browser and confirm notifications/worker behavior.
10. If deployment fails, roll back to the previous release bundle and restart Compose with the previous version.

## Application version metadata 🔖

The UI header logo shows the application version string as small text near the logo name and also exposes the same value as hover tooltip.

Resolution order:

1. Git commit SHA (environment variables first, then `git rev-parse`) + `package.json` version.
2. Root `VERSION` file content.
3. `package.json` version only.

Examples:

- `0.1.0+abc123def456`
- `0.1.0+unknown`
- `0.1.0`

Notes:

- The value is resolved once per process lifetime and cached in memory.
- `VERSION` is intended as a durable fallback for tarball/offline builds where git metadata is unavailable.

## Project structure 📊

```
data-monitor/
├── .github/actions/       # Reusable local GitHub composite actions.
├── .github/workflows/     # GitHub CI/CD workflow definitions.
├── .vscode/               # VS Code settings related to Tailwind CSS syntax
├── openapi/               # OpenAPI 3.1 source files (split JSON structure).
├── public/                # static assets served by Next.js.
├── scripts/               # Utility scripts (for example OpenAPI validation).
├── src/                   # application source code
├── .dockerignore          # List of files ignored by Docker
├── .gitignore             # List of files ignored by GIT
├── CODEOWNERS             # List of code owners and review routing.
├── docker-compose.yml     # Docker self-host deployment stack (postgres, web, worker, init)
├── Dockerfile             # Docker container image definition for the app runtime
├── eslint.config.mjs      # Linting configuration
├── jsconfig.json          # Path aliasing and editor tooling configuration.
├── LICENSE                # GPL-2.0 license description
├── next.config.mjs        # Next.js runtime/build configuration.
├── package-lock.json      # Node.js snapshot of the dependency tree
├── package.json           # Node.js project metadata (scripts and dependency definitions)
├── postcss.config.mjs     # CSS/PostCSS pipeline configuration.
├── VERSION                # Build/release version metadata fallback (e.g. x.y.z+sha)
└── README.md              # Top-level project description and operational runbooks
```

## Contributing 🤝

Contributions are welcome! To contribute:
- Fork the repository.
- Create a new branch for your feature or bugfix.
- Submit a pull request with a clear description of your changes.

## License 📜

This project is licensed under the GPL-2.0 license.
See the [LICENSE](./LICENSE) file for details.

## Contact 💬

For questions or suggestions, feel free to contact me through GitHub or via [email](mailto:piopon.github@gmail.com).

---
<p align="center">Created by PNK with ❤ @ 2025-2026</p>