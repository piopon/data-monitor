import { DiscordNotifier } from "../../src/notifiers/DiscordNotifier.js";

describe("DiscordNotifier", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  test("returns failure when webhook is missing", async () => {
    const notifier = new DiscordNotifier({ name: "Alerts", avatar: "https://default.png" });

    const result = await notifier.notify({
      name: "CPU",
      details: { message: "Threshold exceeded", threshold: "80", data: "92" },
    });

    expect(result).toEqual({ result: false, info: "Discord notifier is not configured!" });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("sends discord message with compatible avatar and embedded details", async () => {
    const notifier = new DiscordNotifier({
      webhook: "https://discord.test/webhook",
      name: "Alerts",
      avatar: "https://default.png",
    });

    global.fetch.mockResolvedValueOnce({ ok: true });

    const data = {
      name: "CPU",
      avatar: "https://img.test/avatar.jpg",
      details: { message: "Threshold exceeded", threshold: "80", data: "92" },
    };

    const result = await notifier.notify(data);

    expect(result).toEqual({ result: true, info: "Discord message sent!" });
    expect(global.fetch).toHaveBeenCalledTimes(1);

    const [url, request] = global.fetch.mock.calls[0];
    const body = JSON.parse(request.body);

    expect(url).toBe("https://discord.test/webhook");
    expect(request.method).toBe("POST");
    expect(request.headers["Content-Type"]).toBe("application/json");
    expect(body.username).toBe("[Alerts] CPU");
    expect(body.avatar_url).toBe("https://img.test/avatar.jpg");
    expect(body.content).toBe("Threshold exceeded");
    expect(body.embeds[0].title).toBe("Notification details");
    expect(body.embeds[0].fields).toEqual([
      { name: "who", value: "CPU", inline: true },
      { name: "threshold", value: "80", inline: true },
      { name: "current data", value: "92", inline: true },
    ]);
  });

  test("falls back to configured avatar when source avatar extension is unsupported", async () => {
    const notifier = new DiscordNotifier({
      webhook: "https://discord.test/webhook",
      name: "Alerts",
      avatar: "https://default.png",
    });

    global.fetch.mockResolvedValueOnce({ ok: true });

    await notifier.notify({
      name: "CPU",
      avatar: "https://img.test/avatar.gif",
      details: { message: "Threshold exceeded", threshold: "80", data: "92" },
    });

    const [, request] = global.fetch.mock.calls[0];
    const body = JSON.parse(request.body);
    expect(body.avatar_url).toBe("https://default.png");
  });

  test("returns failure when fetch throws", async () => {
    const notifier = new DiscordNotifier({
      webhook: "https://discord.test/webhook",
      name: "Alerts",
      avatar: "https://default.png",
    });

    global.fetch.mockRejectedValueOnce(new Error("network failure"));

    const result = await notifier.notify({
      name: "CPU",
      details: { message: "Threshold exceeded", threshold: "80", data: "92" },
    });

    expect(result).toEqual({ result: false, info: "Cannot send discord message: network failure" });
  });
});
