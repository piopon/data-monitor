import { NotifierCatalog } from "./NotifierCatalog.js";
import { NotifierRegistry } from "./NotifierRegistry.js";

export class NotifierValidator {
  /**
   * Method used to validate notifiers configuration
   * @note This application compares notifier settings from registry and supported list
   * @returns correct result when validation is correct, incorrect result otherwise
   */
  static validateConfiguration() {
    const notifiersList = NotifierCatalog.getSupportedNotifiers();
    const notifiersRegistry = NotifierRegistry.getNotifiersRegistry();

    if (notifiersList.size !== notifiersRegistry.size) {
      return { result: false, info: `❌ Notifier registry size mismatch.` };
    }
    for (const [notifierId, className] of notifiersList.entries()) {
      if (!notifiersRegistry.has(className)) {
        return { result: false, info: `❌ Missing backend class "${className}" for notifier "${notifierId}".` };
      }
    }
    return { result: true, info: `✅ Notifier configuration validated successfully.` };
  }
}
