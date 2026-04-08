import { AppConfig } from "@/config/AppConfig";
import { DataCrypto } from "@/lib/DataCrypto";
import { RequestUtils } from "@/lib/RequestUtils";
import { ScraperRequest } from "@/lib/ScraperRequest";
import { MonitorService } from "@/model/MonitorService";
import { NotifierService } from "@/model/NotifierService";
import { UserService } from "@/model/UserService";

const RUN_MIGRATION_ON_INIT = process.env.CRYPTO_MIGRATE_ON_INIT !== "false";
const RUN_REENCRYPT_ON_INIT = process.env.CRYPTO_REENCRYPT_ON_INIT === "true";
let sensitiveMigrationPromise = undefined;

/**
 * Method used to execute sensitive-data migration once per process lifetime
 * @returns object with migration counts
 */
async function migrateSensitiveData() {
  if (!RUN_MIGRATION_ON_INIT) {
    return { users: 0, notifiers: 0 };
  }
  if (sensitiveMigrationPromise) {
    return sensitiveMigrationPromise;
  }
  sensitiveMigrationPromise = (async () => {
    DataCrypto.assertConfigured();
    const migratedUsers = await UserService.migrateSensitiveData({ reencrypt: RUN_REENCRYPT_ON_INIT });
    const migratedNotifiers = await NotifierService.migrateSensitiveData({ reencrypt: RUN_REENCRYPT_ON_INIT });
    console.info(`Sensitive-data migration done (users=${migratedUsers}, notifiers=${migratedNotifiers}).`);
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
  try {
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

    await migrateSensitiveData();
    const featuresResponse = await ScraperRequest.GET(AppConfig.getConfig().scraper.endpoints.features);
    if (!featuresResponse.ok) {
      const result = { init: false, message: await RequestUtils.getResponseMessage(featuresResponse) };
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
  } catch (error) {
    const result = { init: false, message: `Cannot initialize application: ${error.message}` };
    return new Response(JSON.stringify(result), {
      status: RequestUtils.getErrorStatus(error, 500),
      headers: { "Content-Type": "application/json" },
    });
  }
}
