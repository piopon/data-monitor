import { AppConfig } from "../../config/AppConfig.js";
import { DiscordNotifier } from "../DiscordNotifier.js";
import { MailNotifier } from "../MailNotifier.js";

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
        throw new Error(`Not registered notifier type: ${classInfo.type}`);
      }
      const config = NotifierRegistry.#CONFIG[classInfo.config];
      NotifierRegistry.#INSTANCES.set(classInfo.type, new NotifierClass(config));
    }
    return NotifierRegistry.#INSTANCES.get(classInfo.type);
  }

  /**
   * Method used to retrieve the immutable copy of notifiers registry with retrieval-only fields
   * @returns the read-only object with notifiers registry
   */
  static getNotifiersRegistry() {
    const obj = NotifierRegistry.#REGISTRY;
    return Object.freeze({
      get: (key) => obj[key],
      has: (key) => key in obj,
      keys: () => Object.keys(obj),
      values: () => Object.values(obj),
      entries: () => Object.entries(obj),
      size: Object.keys(obj).length,
    });
  }
}
