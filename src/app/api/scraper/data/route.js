import { AppConfig } from "@/config/AppConfig";

export async function GET(req) {
  const appConfig = AppConfig.getConfig();
  const scraperUrl = `http://${appConfig.scraper.host}:${appConfig.scraper.port}`;
  const response = await fetch(`${scraperUrl}/api/v1/data`, {
    method: "GET",
    headers: { Authorization: req.headers.get("authorization") || "" },
  });
  return new Response(JSON.stringify(await response.json()), {
    status: response.status,
    headers: response.headers,
  });
}
