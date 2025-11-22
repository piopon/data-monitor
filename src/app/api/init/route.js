import { AppConfig } from "@/config/AppConfig";
import { ScraperRequest } from "@/lib/ScraperRequest";
import { MonitorService } from "@/model/MonitorService";
import { UserService } from "@/model/UserService";

export async function GET(request) {
  const userInitResult = await UserService.initializeTable();
  if (!userInitResult.result) {
    const result = {init: false, message: userInitResult.message};
    return new Response(JSON.stringify(result), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  const monitorInitResult = await MonitorService.initializeTable();
  if (!monitorInitResult.result) {
    const result = {init: false, message: monitorInitResult.message};
    return new Response(JSON.stringify(result), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  const featuresResponse = await ScraperRequest.GET(AppConfig.getConfig().scraper.endpoints.features);
  if (!featuresResponse.ok) {
    const result = {init: false, message: "Cannot get scraper features status"};
    return new Response(JSON.stringify(result), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  const features = await featuresResponse.json();
  features["init"] = true;
  features["message"] = "Database initialized correctly.";
  return new Response(JSON.stringify(features), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
