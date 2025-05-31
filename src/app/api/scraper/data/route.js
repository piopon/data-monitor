import { AppConfig } from "@/config/AppConfig";
import { ScraperRequest } from "@/lib/ScraperRequest";

export async function GET(req) {
  const appConfig = AppConfig.getConfig();
  const scraperUrl = `http://${appConfig.scraper.host}:${appConfig.scraper.port}`;
  const scraper = new ScraperRequest(scraperUrl);

  return scraper.get(appConfig.scraper.endpoints.data, { Authorization: req.headers.get("authorization") || "" });
}
