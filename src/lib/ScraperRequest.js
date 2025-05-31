import { AppConfig } from "@/config/AppConfig";

export class ScraperRequest {
  static #config = AppConfig.getConfig();
  static #scraperUrl = `http://${this.#config.scraper.host}:${this.#config.scraper.port}`;

  static POST(endpoint, headers, body) {
    return this.#sendRequest(`${this.#scraperUrl}${endpoint}`, "POST", headers, body);
  }

  static GET(endpoint, headers) {
    return this.#sendRequest(`${this.#scraperUrl}${endpoint}`, "GET", headers);
  }

  static async #sendRequest(url, method, headers, body = undefined) {
    const response = await fetch(url, {
      method: method,
      headers: headers,
      ...(body && { body }),
    });
    return new Response(JSON.stringify(await response.json()), {
      status: response.status,
      headers: response.headers,
    });
  }
}
