import { AppConfig } from "@/config/AppConfig";

export class ScraperRequest {
  static #config = AppConfig.getConfig();
  static #scraperUrl = `http://${this.#config.scraper.host}:${this.#config.scraper.port}`;

  /**
   * Method used to send POST request to scraper backend service
   * @param {string} endpoint Concrete endpoint to which the request should be sent
   * @param {Object} headers Request headers object
   * @param {Object} body Optional request body object
   * @returns response object received from scraper backend
   */
  static POST(endpoint, headers, body) {
    return this.#sendRequest(`${this.#scraperUrl}${endpoint}`, "POST", headers, body);
  }

  /**
   * Method used to send GET request to scraper backend service
   * @param {string} endpoint Concrete endpoint to which the request should be sent
   * @param {Object} headers Request headers object
   * @returns response object received from scraper backend
   */
  static GET(endpoint, headers) {
    return this.#sendRequest(`${this.#scraperUrl}${endpoint}`, "GET", headers);
  }

  /**
   * Method used to send request to scraper backend service
   * @param {string} url Complete URI to send the request (IP:PORT/ENDPOINT)
   * @param {string} method Request method type (GET, POST, PUT, DELETE, etc.)
   * @param {Object} headers Request headers object
   * @param {Object} body Optional request body object
   * @returns response object received from scraper backend
   */
  static async #sendRequest(url, method, headers, body = undefined) {
    const response = await fetch(url, {
      method: method,
      headers: headers,
      ...(body && { body }),
    });
    const responseContent = response.ok ? JSON.stringify(await response.json()) : await response.text();
    return new Response(responseContent, {
      status: response.status,
      headers: response.headers,
    });
  }
}
