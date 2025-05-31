import { AppConfig } from "@/config/AppConfig";
import { ScraperRequest } from "@/lib/ScraperRequest";

export async function POST(req) {
  return ScraperRequest.POST(
    AppConfig.getConfig().scraper.endpoints.login,
    { "Content-Type": "application/json" },
    JSON.stringify(await req.json())
  );
}
