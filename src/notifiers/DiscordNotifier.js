export class DiscordNotifier {
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
          embeds: [this.#getEmbeddedNotificationDetails(data)],
        }),
      });
      return { result: true, info: `Discord message sent!` };
    } catch (err) {
      return { result: false, info: `Cannot send discord message: ${err.message}` };
    }
  }

  /**
   * Method used to verify and return a suitable version of notification avatar
   * @note input will be used when it has compatible extension, otherwise a default avatar is returned
   * @param {String} dataAvatar The URL address to the data avatar
   * @returns string containing the used avatar URL
   */
  #getAvatar(dataAvatar) {
    for (let index = 0; index < DiscordNotifier.#AVATAR_EXTENSIONS.length; index++) {
      const extension = DiscordNotifier.#AVATAR_EXTENSIONS[index];
      if (dataAvatar.endsWith(extension)) {
        return dataAvatar;
      }
    }
    return this.#config.avatar;
  }

  /**
   * Method used to retrieve the embedded notification details data based on input values
   * @param {Object} data The input to be placed into embedded notification block
   * @returns an object containing discord message embedded data
   */
  #getEmbeddedNotificationDetails(data) {
    return {
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
    };
  }

  /**
   * Method used to return a color code supported by discord based on color name
   * @param {String} colorName The name of the color for which we want the color code
   * @returns number containing the color code based on the input name
   */
  #getColorCode(colorName) {
    return DiscordNotifier.#SUPPORTED_COLOURS.get(
      DiscordNotifier.#SUPPORTED_COLOURS.has(colorName) ? colorName : "default"
    );
  }
}
