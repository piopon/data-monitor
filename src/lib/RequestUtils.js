export class RequestUtils {
  static #DEFAULT_TIMEOUT = 8_000;
  static #DEFAULT_RETRIES = 2;
  static #DEFAULT_RETRY_DELAY = 250;

  static #toNumber(value, fallback) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  static #sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static #isRetryableStatus(status) {
    return status === 429 || status >= 500;
  }

  static getRequestRetryConfig() {
    return Object.freeze({
      timeout: Math.max(1_000, this.#toNumber(process.env.CHECK_REQUEST_TIMEOUT, this.#DEFAULT_TIMEOUT)),
      retries: Math.max(0, Math.floor(this.#toNumber(process.env.CHECK_REQUEST_RETRIES, this.#DEFAULT_RETRIES))),
      retryDelay: Math.max(100, this.#toNumber(process.env.CHECK_REQUEST_RETRY_DELAY, this.#DEFAULT_RETRY_DELAY)),
    });
  }

  static async fetchWithRetry(url, options = {}, config = this.getRequestRetryConfig()) {
    for (let attempt = 0; attempt <= config.retries; attempt++) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);
      try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        if (!this.#isRetryableStatus(response.status) || attempt === config.retries) {
          return response;
        }
        console.warn(
          `Request failed with status ${response.status}. ` +
            `Retrying ${attempt + 1}/${config.retries}...`
        );
      } catch (error) {
        if (attempt === config.retries) {
          throw error;
        }
        const message = error.name === "AbortError" ? `Request timeout after ${config.timeout} ms` : error.message;
        console.warn(`Request failed: ${message}. Retrying ${attempt + 1}/${config.retries}...`);
      } finally {
        clearTimeout(timeoutId);
      }
      await this.#sleep(config.retryDelay * (attempt + 1));
    }
    throw new Error("Request retries exceeded");
  }
}
