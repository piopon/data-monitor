import { NotifierCatalog } from "../../../src/notifiers/core/NotifierCatalog.js";

describe("NotifierCatalog", () => {
  test("returns class info for supported notifier type", () => {
    expect(NotifierCatalog.getClassInfo("email")).toEqual({
      config: "email",
      type: "MailNotifier",
    });
    expect(NotifierCatalog.getClassInfo("discord")).toEqual({
      config: "discord",
      type: "DiscordNotifier",
    });
  });

  test("throws for unsupported notifier type", () => {
    expect(() => NotifierCatalog.getClassInfo("sms")).toThrow("Unsupported notifier type: sms");
  });

  test("exposes a read-only supported notifiers object", () => {
    const supported = NotifierCatalog.getSupportedNotifiers();

    expect(Object.isFrozen(supported)).toBe(true);
    expect(supported.size).toBe(2);
    expect(supported.has("email")).toBe(true);
    expect(supported.get("email")).toBe("MailNotifier");
    expect(supported.keys()).toEqual(["email", "discord"]);
    expect(supported.values()).toEqual(["MailNotifier", "DiscordNotifier"]);
    expect(supported.entries()).toEqual([
      ["email", "MailNotifier"],
      ["discord", "DiscordNotifier"],
    ]);
  });
});
