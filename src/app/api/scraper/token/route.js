import { AppConfig } from "@/config/AppConfig";
import { ScraperRequest } from "@/lib/ScraperRequest";

export async function POST(req) {
  const appConfig = AppConfig.getConfig();
  const scraper = new ScraperRequest();

  return scraper.post(
    appConfig.scraper.endpoints.login,
    { "Content-Type": "application/json" },
    JSON.stringify(await req.json())
  );
}
