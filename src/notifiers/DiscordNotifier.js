import { Notifier } from "./Notifier.js";

export class DiscordNotifier extends Notifier {
  static #AVATAR_EXTENSIONS = [".jpg", ".png"];

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
    try {
      await fetch(this.#config.webhook, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: `[${this.#config.name}] ${data.name}`,
          avatar_url: this.#getAvatar(data.avatar),
          content: data.details.message,
          embeds: [
            {
              title: "Notification details",
              color: this.#getColorCode("green"),
              fields: [
                {
                  name: "who",
                  value: data.name,
                  inline: true,
                },
                {
                  name: "threshold",
                  value: data.details.threshold,
                  inline: true,
                },
                {
                  name: "current data",
                  value: data.details.data,
                  inline: true,
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

  #getAvatar(dataAvatar) {
    for (let index = 0; index < DiscordNotifier.#AVATAR_EXTENSIONS.length; index++) {
      const extension = DiscordNotifier.#AVATAR_EXTENSIONS[index];
      if (dataAvatar.endsWith(extension)) {
        return dataAvatar;
      }
    }
    return this.#config.avatar;
  }

  #getColorCode(colorName) {
    switch (colorName) {
      case "green":
        return 0x57f287;
      case "gold":
        return 0xf1c40f;
      case "red":
        return 0xed4245;
      case "yellow":
        return 0xfee75c;
      case "orange":
        return 0xe67e22;
      case "blue":
        return 0x3498db;
      default:
        return 0x95a5a6;
    }
  }
}
