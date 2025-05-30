import { AppConfig } from "@/config/AppConfig";

export async function POST(req) {
  const appConfig = AppConfig.getConfig();
  const scraperUrl = `http://${appConfig.scraper.host}:${appConfig.scraper.port}`;
  const response = await fetch(`${scraperUrl}${appConfig.scraper.endpoints.login}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(await req.json()),
  });
  return new Response(JSON.stringify(await response.json()), {
    status: response.status,
    headers: response.headers,
  });
}
