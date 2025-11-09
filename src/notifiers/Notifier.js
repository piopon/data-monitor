export class Notifier {
  static #SUPPORTED_NOTIFIERS = new Map([
    ["email", "MailNotifier"],
    ["discord", "DiscordNotifier"],
  ]);

  static getSupportedList() {
    const supported = [];
    [...Notifier.#SUPPORTED_NOTIFIERS.keys()].forEach(key => supported.push({ value: key, text: key }));
    return supported;
  }

  static getClassInfo(notifier) {
    if (Notifier.#SUPPORTED_NOTIFIERS.has(notifier)) {
      return { config: notifier, type: Notifier.#SUPPORTED_NOTIFIERS.get(notifier)};
    }
    return undefined;
  }
}
