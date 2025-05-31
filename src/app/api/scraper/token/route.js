import { AppConfig } from "@/config/AppConfig";
import { ScraperRequest } from "@/lib/ScraperRequest";

/**
 * Method used to send the login POST request to scraper backend service
 * @param {Object} req Request object received from the frontend
 * @returns Response object with JWT value
 */
export async function POST(req) {
  return ScraperRequest.POST(
    AppConfig.getConfig().scraper.endpoints.login,
    { "Content-Type": "application/json" },
    JSON.stringify(await req.json())
  );
}
