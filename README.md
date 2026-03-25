# data-monitor

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

## Release runbook

Use this runbook when publishing and deploying a release.

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

## Docker compose self-host runbook

This repository now includes a production-oriented Docker setup for self-hosted deployments.
The compose stack starts these containers:

- `postgres`: application database
- `web`: Next.js production server
- `worker`: background monitor/notifier process
- `init`: DB initialization process

### Quick start

Create `.env` in the repository root with the following sample values:

```env
# CONNECTION PARAMETERS
SERVER_URL=localhost
SERVER_PORT=3000

# MONITOR SERVICE
INIT_ON_START=true

# BACKEND SCRAPER SERVICE
NEXT_PUBLIC_SCRAPER_URL=
SCRAPER_HOST=localhost
SCRAPER_PORT=5000
SCRAPER_URL_LOGIN=/auth/token
SCRAPER_URL_LOGOUT=/auth/logout
SCRAPER_URL_DATA=/api/v1/data
SCRAPER_URL_ITEMS=/api/v1/data/items
SCRAPER_URL_EDIT=?challenge=
SCRAPER_URL_FEATURES=/api/v1/settings/features

# DATABASE SERVICE
DB_USER=
DB_PASS=
DB_HOST=localhost
DB_PORT=5432
DB_NAME=data-monitor

# CRYPTOGRAPHY
CRYPTO_SECRET=
CRYPTO_LEGACY_SECRETS=
CRYPTO_MIGRATE_ON_INIT=false
CRYPTO_REENCRYPT_ON_INIT=false

# DATA CHECK SETTINGS
CHECK_INTERVAL=60000
CHECK_DELAY=5000
CHECK_WAIT=1000
CHECK_NOTIFY=3600000
CHECK_MONITOR_CONCURRENCY=5

# NOTIFIERS SETTINGS
NOTIFIER_DISCORD_HOOK=
NOTIFIER_DISCORD_NAME=data-monitor
NOTIFIER_DISCORD_AVATAR=
NOTIFIER_MAIL_SERVICE=
NOTIFIER_MAIL_ADDRESS=
NOTIFIER_MAIL_PASSWORD=

# RETRY FETCHING SETTINGS
REQUEST_TIMEOUT=8000
REQUEST_RETRIES=2
REQUEST_RETRY_DELAY=250
```

Remember to add ALL user/password/secret keys and don't share them with anyone.
Also fill notifier section based on your needs.

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

By default, web app is exposed on `http://localhost:3000`.


## Sensitive data encryption key

To encrypt database fields containing secrets, configure this environment variable before running the app:

```bash
CRYPTO_SECRET=<long-random-secret-value>
```

Use a long, random value and keep it private. The application derives the encryption key for sensitive model fields from this value.
Losing this secret results in irreversible loss of access to encrypted data, so keep a secure backup.

### Optional migration and rotation flags

```bash
# Run plaintext -> encrypted migration on init (default: true)
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

### Secret rotation runbook

1. Generate a new long random secret and set it as `CRYPTO_SECRET`.
2. Put previous secret values in `CRYPTO_LEGACY_SECRETS`.
3. Ensure `CRYPTO_MIGRATE_ON_INIT=true` and set `CRYPTO_REENCRYPT_ON_INIT=true`.
4. Start the app and trigger `GET /api/init` once.
5. Wait for successful init and migration logs.
6. Set `CRYPTO_REENCRYPT_ON_INIT=false` and remove old values from `CRYPTO_LEGACY_SECRETS`.
7. Restart the app and verify normal reads/writes.

> [!IMPORTANT]
> Keep legacy secrets configured until all encrypted rows are re-encrypted and all running instances use the new active secret.

---
<p align="center">Created by PNK with ❤ @ 2025-2026</p>