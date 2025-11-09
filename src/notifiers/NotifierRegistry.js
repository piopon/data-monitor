import { AppConfig } from "../config/AppConfig.js";
import { DiscordNotifier } from "./DiscordNotifier.js";
import { MailNotifier } from "./MailNotifier.js";

export class NotifierRegistry {
  // Object with supported notifiers class implementations.
  // IMPORTANT: Notifier implementations contain backend-only dependencies and references.
  //            Thus it cannot be imported by frontend (client) classes
  static #REGISTRY = {
    MailNotifier,
    DiscordNotifier,
  };
  static #INSTANCES = new Map();
  static #CONFIG = AppConfig.getConfig().notifier;

  /**
   * Method used to create a concrete notifier instance based on the provided information
   * @param {Object} classInfo Notifier class information containing type and config data
   * @returns a concrete notifier object based on the provided information
   */
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
