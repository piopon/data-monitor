import { AppConfig } from "@/config/AppConfig";
import { ScraperRequest } from "@/lib/ScraperRequest";

/**
 * Method used to send the logout POST request to scraper backend service
 * @param {Object} request Request object received from the frontend
 * @returns Response object with JWT value
 */
export async function POST(request) {
  return ScraperRequest.POST(
    AppConfig.getConfig().scraper.endpoints.logout,
    { "Content-Type": "application/json" },
    JSON.stringify(await request.json())
  );
}
