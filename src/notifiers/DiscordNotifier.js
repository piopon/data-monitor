import { Notifier } from "./Notifier.js";

export class DiscordNotifier extends Notifier {
  static #AVATAR_EXTENSIONS = [".jpg", ".png"];
  static #SUPPORTED_COLOURS = new Map([
    ["default", 0x95a5a6],
    ["green", 0x57f287],
    ["gold", 0xf1c40f],
    ["red", 0xed4245],
    ["yellow", 0xfee75c],
    ["orange", 0xe67e22],
    ["blue", 0x3498db],
    ["purple", 0x9b59b6],
    ["fuchsia", 0xeb459e],
    ["navy", 0x34495e],
  ]);

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
    return DiscordNotifier.#SUPPORTED_COLOURS.get(
      DiscordNotifier.#SUPPORTED_COLOURS.has(colorName) ? colorName : "default"
    );
  }
}
