import { AppConfig } from "../config/AppConfig.js";
import { DiscordNotifier } from "./DiscordNotifier.js";
import { MailNotifier } from "./MailNotifier.js";

export class NotifierRegistry {
  static #CONFIG = AppConfig.getConfig().notifier;
  static #REGISTRY = {
    MailNotifier,
    DiscordNotifier,
  };

  static create(classInfo) {
    const NotifierClass = NotifierRegistry.#REGISTRY[classInfo.type];
    if (!NotifierClass) {
      throw new Error(`Unsupported notifier type: ${type}`);
    }
    const config = NotifierRegistry.#CONFIG[classInfo.config];
    return new NotifierClass(config);
  }
}
