export class ScraperRequest {
  #scraperUrl = undefined;

  constructor(scraperUrl) {
    this.#scraperUrl = scraperUrl;
  }

  post(endpoint, headers, body) {
    return this.#sendRequest(`${this.#scraperUrl}${endpoint}`, "POST", headers, body);
  }

  get(endpoint, headers) {
    return this.#sendRequest(`${this.#scraperUrl}${endpoint}`, "GET", headers);
  }

  async #sendRequest(url, method, headers, body = undefined) {
    const response = await fetch(url, {
      method: method,
      headers: headers,
      ...body && {body},
    });
    return new Response(JSON.stringify(await response.json()), {
      status: response.status,
      headers: response.headers,
    });
  }
}
