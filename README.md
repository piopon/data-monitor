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

To encrypt database fields containing secrets, configure the following environment variable before running the app:

```
CRYPTO_SECRET=<long-random-secret-value>
```

Use a long, random value and keep it private. The application uses this value to derive the encryption key used for sensitive model fields.
**Do not change or rotate this secret after data has been encrypted without a proper migration/re-encryption process**, as any values encrypted with the old key will become permanently undecryptable.
Losing this secret will result in irreversible loss of access to the encrypted data, so make sure you have a secure backup strategy for it.

---
<p align="center">Created by PNK with ❤ @ 2025-2026</p>