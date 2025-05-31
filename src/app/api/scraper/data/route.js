import { AppConfig } from "@/config/AppConfig";
import { ScraperRequest } from "@/lib/ScraperRequest";

export async function GET(req) {
  return ScraperRequest.GET(
    AppConfig.getConfig().scraper.endpoints.data,
    { Authorization: req.headers.get("authorization") || "" }
  );
}
