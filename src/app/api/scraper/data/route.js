import { AppConfig } from "@/config/AppConfig";
import { ScraperRequest } from "@/lib/ScraperRequest";

export async function GET(req) {
  const appConfig = AppConfig.getConfig();
  const scraper = new ScraperRequest();

  return scraper.get(appConfig.scraper.endpoints.data, { Authorization: req.headers.get("authorization") || "" });
}
