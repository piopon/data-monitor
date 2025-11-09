import { AppConfig } from "../config/AppConfig.js";
import { DiscordNotifier } from "./DiscordNotifier.js";
import { MailNotifier } from "./MailNotifier.js";

export class NotifierRegistry {
  static #CONFIG = AppConfig.getConfig().notifier;
  static #INSTANCES = new Map();
  static #REGISTRY = {
    MailNotifier,
    DiscordNotifier,
  };

  static create(classInfo) {
    if (!NotifierRegistry.#INSTANCES.has(classInfo.type)) {
      const NotifierClass = NotifierRegistry.#REGISTRY[classInfo.type];
      if (!NotifierClass) {
        throw new Error(`Unsupported notifier type: ${type}`);
      }
      const config = NotifierRegistry.#CONFIG[classInfo.config];
      NotifierRegistry.#INSTANCES.set(classInfo.type, new NotifierClass(config));
    }
    return NotifierRegistry.#INSTANCES.get(classInfo.type);
  }
}
