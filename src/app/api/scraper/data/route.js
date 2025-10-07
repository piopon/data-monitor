import { AppConfig } from "@/config/AppConfig";
import { ScraperRequest } from "@/lib/ScraperRequest";

/**
 * Method used to send the data GET request to scraper backend service
 * @param {Object} request Request object received from the frontend
 * @returns Response object with data values
 */
export async function GET(request) {
  return ScraperRequest.GET(
    AppConfig.getConfig().scraper.endpoints.items,
    { Authorization: request.headers.get("authorization") || "" }
  );
}
