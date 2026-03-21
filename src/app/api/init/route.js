import { AppConfig } from "@/config/AppConfig";
import { SensitiveDataCodec } from "@/lib/SensitiveDataCodec";
import { ScraperRequest } from "@/lib/ScraperRequest";
import { MonitorService } from "@/model/MonitorService";
import { NotifierService } from "@/model/NotifierService";
import { UserService } from "@/model/UserService";

export async function GET(request) {
  let migratedUsers = 0;
  let migratedNotifiers = 0;

  const userInitResult = await UserService.initializeTable();
  if (!userInitResult.result) {
    const result = { init: false, message: userInitResult.message };
    return new Response(JSON.stringify(result), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  const notifierInitResult = await NotifierService.initializeTable();
  if (!notifierInitResult.result) {
    const result = { init: false, message: notifierInitResult.message };
    return new Response(JSON.stringify(result), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
  const monitorInitResult = await MonitorService.initializeTable();
  if (!monitorInitResult.result) {
    const result = { init: false, message: monitorInitResult.message };
    return new Response(JSON.stringify(result), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    SensitiveDataCodec.assertConfigured();
    migratedUsers = await UserService.migrateSensitiveData();
    migratedNotifiers = await NotifierService.migrateSensitiveData();
  } catch (error) {
    const result = { init: false, message: `Cannot migrate sensitive data: ${error.message}` };
    return new Response(JSON.stringify(result), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const featuresResponse = await ScraperRequest.GET(AppConfig.getConfig().scraper.endpoints.features);
  if (!featuresResponse.ok) {
    const result = { init: false, message: await featuresResponse.text() };
    return new Response(JSON.stringify(result), {
      status: featuresResponse.status,
      headers: { "Content-Type": "application/json" },
    });
  }
  const features = await featuresResponse.json();
  features["init"] = true;
  features["message"] = `Database initialized correctly. Migrated users: ${migratedUsers}, migrated notifiers: ${migratedNotifiers}.`;
  return new Response(JSON.stringify(features), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
