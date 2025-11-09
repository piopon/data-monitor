export class Notifier {
  // Map of all supported notifiers and their respective class implementations.
  // IMPORTANT: We have to use strings as values because this logic will be used from both client and server code.
  //            There will be no problem on the backend side, but frontend will crash when importing server-side code.
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
