import { AppConfig } from "@/config/AppConfig";
import { ScraperRequest } from "@/lib/ScraperRequest";
import { MonitorService } from "@/model/MonitorService";
import { UserService } from "@/model/UserService";

export async function GET(request) {
  const userInitResult = await UserService.initializeTable();
  if (!userInitResult.result) {
    return new Response(JSON.stringify(userInitResult.message), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  const monitorInitResult = await MonitorService.initializeTable();
  if (!monitorInitResult.result) {
    return new Response(JSON.stringify(monitorInitResult.message), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  const featuresResponse = await ScraperRequest.GET(AppConfig.getConfig().scraper.endpoints.features);
  if (!featuresResponse.ok) {
    return new Response(JSON.stringify("Cannot get scraper features"), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  return new Response(JSON.stringify(await featuresResponse.json()), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
