import { AppConfig } from "../../config/AppConfig.js";
import { Notifier } from "./Notifier.js";
import { NotifierRegistry } from "./NotifierRegistry.js";

export class NotifierValidator {
  /**
   * Method used to validate notifiers configuration
   * @note This application compares app config with notifier registry and supported list
   * @returns correct result when whole config is correct, incorrect result otherwise
   */
  static validateConfiguration() {
    const notifiersList = Notifier.getSupportedNotifiers();
    const notifiersRegistry = NotifierRegistry.getNotifiersRegistry();
    const notifiersConfig = Object.keys(AppConfig.getConfig().notifier);

    if (notifiersList.size !== notifiersRegistry.size || notifiersList.size !== notifiersConfig.length) {
      return {result: false, info: `❌ Notifier config sizes mismatch.`};
    }
    for (const [notifierId, className] of notifiersList.entries()) {
      if (!notifiersConfig.includes(notifierId)) {
        return {result: false, info: `❌ Missing config entry for notifier "${notifierId}".`};
      }
      if (!notifiersRegistry.has(className)) {
        return {result: false, info: `❌ Missing backend class "${className}" for notifier "${notifierId}".`};
      }
    }
    return {result: true, info: `✅ Notifier configuration validated successfully.`};
  }
}
