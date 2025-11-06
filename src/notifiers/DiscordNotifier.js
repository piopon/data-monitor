import { Notifier } from "./Notifier.js";

export class DiscordNotifier extends Notifier {
  #config = undefined;

  constructor(config) {
    super();
    this.#config = config;
  }

  async notify(data) {
    if (!this.#config.webhook) {
      return { result: false, info: `Discord notifier is not configured!` };
    }
    const avatar = data.avatar.endsWith(".jpg") ? data.avatar : this.#config.avatar;
    try {
      await fetch(this.#config.webhook, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: this.#config.name,
          avatar_url: avatar,
          content: data.details,
          embeds: [
            {
              title: "Notification details",
              color: 5763719,
              fields: [
                {
                  name: "who",
                  value: data.name,
                  inline: false,
                },
                {
                  name: "data",
                  value: data.details,
                  inline: false,
                },
              ],
            },
          ],
        }),
      });
      return { result: true, info: `Discord message sent!` };
    } catch (err) {
      return { result: false, info: `Cannot send discord message: ${err.message}` };
    }
  }
}
