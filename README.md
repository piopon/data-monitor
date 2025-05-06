# data-monitor

> [!WARNING]
> This repository is currently under heavy development and currently this readme file documentation presents only the idea of the logic in the wish-list form.

This single page application is used to display the data provided by the [scraper backend service](https://github.com/piopon/web-scraper) in a minimalist form factor.
When needed it can also be configured to use the predefined notifiers and send a message when the received data values meet the defined criterias. For example: when the received data represent a price value then we can send a notification message when this price is lower than a specific threshold.

> [!TIP]
> Although it's explicitly stated that the scraper service is used as the data provider, this application can use any REST API server as its backend.
> The only requirement is that the JSON structure must match the one described in the scraper documentation.
> For more information check [this sample JSON file](https://github.com/piopon/web-scraper/blob/main/docs/json/data.json)

---
<p align="center">Created by PNK with ❤ @ 2025</p>