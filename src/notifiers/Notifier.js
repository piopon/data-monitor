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
}
