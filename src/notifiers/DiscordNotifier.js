import { Notifier } from "./Notifier.js";

export class DiscordNotifier extends Notifier {
  #config = undefined;

  constructor(config) {
    super();
    this.#config = config;
  }

  async notify(data) {
    try {
      await fetch(this.#config.webhook, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: data.receiver,
          avatar_url: "https://i.imgur.com/mDKlggm.png",
          content: data.details,
        }),
      });
      return { result: true, info: `Discord message sent!` };
    } catch (err) {
      return { result: false, info: `Cannot send discord message: ${err.message}` };
    }
  }
}
