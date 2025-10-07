import { AppConfig } from "@/config/AppConfig";
import { ScraperRequest } from "@/lib/ScraperRequest";

export async function GET(request) {
  return ScraperRequest.GET(
    AppConfig.getConfig().scraper.endpoints.items,
    { Authorization: request.headers.get("authorization") || "" }
  );
}
