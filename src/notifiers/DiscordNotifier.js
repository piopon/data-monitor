import { Notifier } from "./Notifier.js";

export class DiscordNotifier extends Notifier {
  #config = undefined;

  /**
   * Creates a new discord notifier with the specified configuration
   * @param {Object} config Input configuration needed to send notification
   */
  constructor(config) {
    super();
    this.#config = config;
  }

  /**
   * Method used to notify the user about data reaching threshold
   * @param {Object} data The notification values to be sent
   * @returns true when notification succeeds, false otherwise
   */
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
          username: `[${this.#config.name}] ${data.name}`,
          avatar_url: avatar,
          content: data.details.message,
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
                  name: "threshold",
                  value: data.details.threshold,
                  inline: false,
                },
                {
                  name: "current data",
                  value: data.details.data,
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
