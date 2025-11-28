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
    try {
      const response = await fetch(url, {
        method: method,
        headers: headers,
        ...(body && { body }),
      });
      const content = await this.#getResponseContent(response);
      return new Response(content, {
        status: response.status,
      });
    } catch (error) {
      return new Response("Scraper backend is not available", { status: 500 });
    }
  }

  /**
   * Method used to receive response content based on content-type from input object
   * @param {Object} response Input object with values received from scraper
   * @returns response content value (JSON for application/json content, text for other types)
   */
  static async #getResponseContent(response) {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      if (response.ok) {
        return JSON.stringify(await response.json());
      }
      const textResponse = await response.text();
      if (textResponse.startsWith('"') && textResponse.endsWith('"')) {
        return textResponse.substring(1, textResponse.length - 1);
      }
      return textResponse;
    }
    return await response.text();
  }

  static #isJsonCompatible(input) {
    try {
      JSON.parse(input);
    } catch (e) {
      return false;
    }
    return true;
  }
}
