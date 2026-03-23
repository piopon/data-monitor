# data-monitor

> [!WARNING]
> This repository is currently under heavy development and currently this readme file documentation presents only the idea of the logic in the wish-list form.

This single page application is used to display the data provided by the [scraper backend service](https://github.com/piopon/web-scraper) in a minimalist form factor.
When needed it can also be configured to use the predefined notifiers and send a message when the received data values meet the defined criterias. For example: when the received data represent a price value then we can send a notification message when this price is lower than a specific threshold.

> [!TIP]
> Although it's explicitly stated that the scraper service is used as the data provider, this application can use any REST API server as its backend.
> The only requirement is that the JSON structure must match the one described in the scraper documentation.
> For more information check [this sample JSON file](https://github.com/piopon/web-scraper/blob/main/docs/json/data.json)


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