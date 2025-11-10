import { Notifier } from "./Notifier.js";
import { NotifierRegistry } from "./NotifierRegistry.js";

export class NotifierValidator {
  static validateConfiguration() {
    const notifiersList = Notifier.getSupportedNotifiers();
    const notifiersRegistry = NotifierRegistry.getNotifiersRegistry();

    if (notifiersList.size !== notifiersRegistry.size) {
      return {result: false, info: `❌ Notifier sizes mismatch.`};
    }
    for (const [notifierId, className] of notifiersList.entries()) {
      if (!notifiersRegistry.has(className)) {
        return {result: false, info: `❌ Missing backend class "${className}" for notifier "${notifierId}"`};
      }
    }
    return {result: true, info: `✅ Notifier configuration validated successfully.`};
  }
}
