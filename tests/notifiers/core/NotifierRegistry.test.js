import { DiscordNotifier } from "../../../src/notifiers/DiscordNotifier.js";
import { NotifierRegistry } from "../../../src/notifiers/core/NotifierRegistry.js";

describe("NotifierRegistry", () => {
  test("creates notifier instance for a registered class", () => {
    const notifier = NotifierRegistry.create(
      { type: "DiscordNotifier", config: "discord" },
      { webhook: "https://discord.test/webhook", name: "Alerts", avatar: "x" },
    );

    expect(notifier).toBeInstanceOf(DiscordNotifier);
  });

  test("throws when requested class type is not registered", () => {
    expect(() =>
      NotifierRegistry.create(
        { type: "SlackNotifier", config: "slack" },
        { webhook: "https://example.com" },
      ),
    ).toThrow("Not registered notifier type: SlackNotifier");
  });

  test("throws when notifier config is missing", () => {
    expect(() => NotifierRegistry.create({ type: "DiscordNotifier", config: "discord" }, null)).toThrow(
      "Missing notifier config for type: DiscordNotifier",
    );
  });

  test("exposes a read-only registry object", () => {
    const registry = NotifierRegistry.getNotifiersRegistry();

    expect(Object.isFrozen(registry)).toBe(true);
    expect(registry.size).toBe(2);
    expect(registry.has("MailNotifier")).toBe(true);
    expect(registry.has("DiscordNotifier")).toBe(true);
    expect(registry.keys()).toEqual(["MailNotifier", "DiscordNotifier"]);
    expect(registry.get("DiscordNotifier")).toBe(DiscordNotifier);
    expect(registry.entries().map(([k]) => k)).toEqual(["MailNotifier", "DiscordNotifier"]);
  });
});
