import { AppConfig } from "@/config/AppConfig";
import { SensitiveDataCodec } from "@/lib/SensitiveDataCodec";
import { ScraperRequest } from "@/lib/ScraperRequest";
import { MonitorService } from "@/model/MonitorService";
import { NotifierService } from "@/model/NotifierService";
import { UserService } from "@/model/UserService";

const RUN_MIGRATION_ON_INIT = process.env.DATA_MONITOR_MIGRATE_ON_INIT !== "false";
let sensitiveMigrationPromise = undefined;

/**
 * Method used to execute sensitive-data migration once per process lifetime
 * @returns object with migration counts
 */
async function migrateSensitiveDataOnce() {
  if (!RUN_MIGRATION_ON_INIT) {
    return { users: 0, notifiers: 0 };
  }
  if (sensitiveMigrationPromise) {
    return sensitiveMigrationPromise;
  }

  sensitiveMigrationPromise = (async () => {
    SensitiveDataCodec.assertConfigured();
    const migratedUsers = await UserService.migrateSensitiveData();
    const migratedNotifiers = await NotifierService.migrateSensitiveData();
    console.info(`Init info: sensitive-data migration done (users=${migratedUsers}, notifiers=${migratedNotifiers}).`);
    return { users: migratedUsers, notifiers: migratedNotifiers };
  })();

  try {
    return await sensitiveMigrationPromise;
  } catch (error) {
    sensitiveMigrationPromise = undefined;
    throw error;
  }
}

export async function GET(request) {
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
    await migrateSensitiveDataOnce();
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
  features["message"] = "Database initialized correctly.";
  return new Response(JSON.stringify(features), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
