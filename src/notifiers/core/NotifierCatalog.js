export class NotifierCatalog {
  // Map of all supported notifiers and their respective class implementations.
  // IMPORTANT: We have to use strings as values because this logic will be used from both client and server code.
  //            There will be no problem on the backend side, but frontend will crash when importing server-side code.
  static #SUPPORTED_NOTIFIERS = new Map([
    ["email", "MailNotifier"],
    ["discord", "DiscordNotifier"],
  ]);

  /**
   * Method used to return the array of supported notifier objects
   * @note It returns the objects in front-end format { value: "notifier", text: "notifier" }
   * @returns an array of supported notifier objects used to fill frontend widgets
   */
  static getWidgetOptions() {
    const supported = [];
    [...NotifierCatalog.#SUPPORTED_NOTIFIERS.keys()].forEach(key => supported.push({ value: key, text: key }));
    return supported;
  }

  /**
   * Method used to return the class information (class name and config) for specified notifier
   * @param {String} notifier The notifier type for which we want to retrieve class info
   * @returns backend class information object for the specified notifier type
   */
  static getClassInfo(notifier) {
    if (NotifierCatalog.#SUPPORTED_NOTIFIERS.has(notifier)) {
      return { config: notifier, type: NotifierCatalog.#SUPPORTED_NOTIFIERS.get(notifier)};
    }
    throw new Error(`Unsupported notifier type: ${notifier}`);
  }

  /**
   * Method used to retrieve the immutable copy of supported notifiers with retrieval-only fields
   * @returns the read-only object with supported notifiers
   */
  static getSupportedNotifiers() {
    const map = NotifierCatalog.#SUPPORTED_NOTIFIERS;
    return Object.freeze({
      get: (key) => map.get(key),
      has: (key) => map.has(key),
      keys: () => [...map.keys()],
      values: () => [...map.values()],
      entries: () => [...map.entries()],
      size: map.size,
    });
  }
}
