export class RequestUtils {
  static #RETRYABLE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
  static #DEFAULT_TIMEOUT = 8_000;
  static #DEFAULT_RETRIES = 2;
  static #DEFAULT_RETRY_DELAY = 250;

  /**
   * Method used to build request URL from base address and query parameters
   * @param {String} baseUrl Base URL without query part
   * @param {Object} queryParams Object with query key-value pairs
   * @returns URL with encoded query string when parameters are provided
   */
  static buildUrl(baseUrl, queryParams = {}) {
    const entries = Object.entries(queryParams).filter(([, value]) => value != null);
    if (entries.length === 0) {
      return baseUrl;
    }
    const query = entries
      .map(([key, value]) => `${encodeURIComponent(String(key))}=${encodeURIComponent(String(value))}`)
      .join("&");
    return `${baseUrl}?${query}`;
  }

  /**
   * Method used to convert input value to number with fallback
   * @param {unknown} value Input value to be converted
   * @param {Number} fallback Number used when input cannot be converted
   * @returns converted number or fallback value
   */
  static #toNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  /**
   * Method used to stop program execution for specified number of milliseconds
   * @param {Number} ms Number of milliseconds to stop program execution
   * @returns promise resolved after specified delay
   */
  static #sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Method used to check whether response status is retryable
   * @param {Number} status HTTP status code
   * @returns true for transient statuses, false otherwise
   */
  static #isRetryableStatus(status) {
    return status === 429 || status >= 500;
  }

  /**
   * Method used to release response body resources before retrying
   * @param {Response} response Response object to be cleaned up
   */
  static async #cancelResponseBody(response) {
    try {
      if (response?.body && !response.body.locked) {
        if ("function" === typeof response.body.cancel) {
          await response.body.cancel();
        }
      } else if (response?.arrayBuffer) {
        if ("function" === typeof response.arrayBuffer) {
          await response.arrayBuffer();
        }
      }
    } catch {
      // Ignore cleanup errors and proceed with retry logic.
    }
  }

  /**
   * Method used to retrieve request retry configuration values from environment
   * @returns timeout/retry configuration object
   */
  static getRequestRetryConfig() {
    return Object.freeze({
      timeout: Math.max(1_000, this.#toNumber(process.env.REQUEST_TIMEOUT, this.#DEFAULT_TIMEOUT)),
      retries: Math.max(0, Math.floor(this.#toNumber(process.env.REQUEST_RETRIES, this.#DEFAULT_RETRIES))),
      retryDelay: Math.max(100, this.#toNumber(process.env.REQUEST_RETRY_DELAY, this.#DEFAULT_RETRY_DELAY)),
    });
  }

  /**
   * Method used to execute a fetch request with timeout and retry policy
   * @note Retries are performed only for idempotent methods
   * @param {String} url Request URL
   * @param {Object} options Fetch options
   * @param {Object} config Request timeout and retry configuration
   * @returns final fetch response object
   */
  static async fetchWithRetry(url, options = {}, config = this.getRequestRetryConfig()) {
    const method = String(options?.method || "GET").toUpperCase();
    const canRetry = this.#RETRYABLE_METHODS.has(method);
    for (let attempt = 0; attempt <= config.retries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);
      try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        if (!canRetry || !this.#isRetryableStatus(response.status) || attempt === config.retries) {
          return response;
        }

        await this.#cancelResponseBody(response);
        console.warn(
          `Request ${method} failed with status ${response.status}. Retrying ${attempt + 1}/${config.retries}...`,
        );
      } catch (error) {
        if (!canRetry || attempt === config.retries) {
          throw error;
        }
        const message = error.name === "AbortError" ? `Request timeout after ${config.timeout} ms` : error.message;
        console.warn(`Request ${method} failed: ${message}. Retrying ${attempt + 1}/${config.retries}...`);
      } finally {
        clearTimeout(timeoutId);
      }
      await this.#sleep(config.retryDelay * (attempt + 1));
    }
    throw new Error("Request retries exceeded");
  }
}
