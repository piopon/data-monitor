import { AppConfig } from "@/config/AppConfig";
import { ScraperRequest } from "@/lib/ScraperRequest";

/**
 * Method used to send the data GET request to scraper backend service
 * @param {Object} req Request object received from the frontend
 * @returns Response object with data values
 */
export async function GET(req) {
  return ScraperRequest.GET(
    AppConfig.getConfig().scraper.endpoints.data,
    { Authorization: req.headers.get("authorization") || "" }
  );
}
