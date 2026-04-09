import { GET, POST, PUT, DELETE } from "../../../../src/app/api/notifier/route.js";
import { authorizeUser } from "@/lib/ApiUserAuth";
import { RequestUtils } from "@/lib/RequestUtils";
import { NotifierService } from "@/model/NotifierService";
import { NotifierCatalog } from "@/notifiers/core/NotifierCatalog";
import { NotifierRegistry } from "@/notifiers/core/NotifierRegistry";

jest.mock("@/lib/ApiUserAuth", () => ({ authorizeUser: jest.fn() }));
jest.mock("@/lib/RequestUtils", () => ({ RequestUtils: { getErrorStatus: jest.fn() } }));
jest.mock("@/model/NotifierService", () => ({
  NotifierService: {
    filterNotifiers: jest.fn(),
    addNotifier: jest.fn(),
    editNotifierForUser: jest.fn(),
    deleteNotifierForUser: jest.fn(),
  },
}));
jest.mock("@/notifiers/core/NotifierCatalog", () => ({
  NotifierCatalog: { getClassInfo: jest.fn() },
}));
jest.mock("@/notifiers/core/NotifierRegistry", () => ({
  NotifierRegistry: { create: jest.fn() },
}));

class MockResponse {
  constructor(body, init = {}) {
    this._body = body;
    this.status = init.status ?? 200;
    const map = Object.fromEntries(Object.entries(init.headers || {}).map(([k, v]) => [String(k).toLowerCase(), v]));
    this.headers = { get: (name) => map[String(name).toLowerCase()] ?? null };
  }
  async json() {
    return JSON.parse(this._body || "null");
  }
}

const reqWithUrl = (url, body) => ({
  nextUrl: new URL(url),
  json: async () => body,
});

describe("app/api/notifier route", () => {
  const originalResponse = global.Response;

  beforeAll(() => {
    global.Response = MockResponse;
  });

  afterAll(() => {
    global.Response = originalResponse;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    authorizeUser.mockResolvedValue(7);
    RequestUtils.getErrorStatus.mockImplementation((error, fallbackStatus = 400) => error?.status ?? fallbackStatus);
  });

  test("GET returns masked sensitive fields", async () => {
    NotifierService.filterNotifiers.mockResolvedValue([{ id: 1, type: "email", origin: "gmail", password: "secret" }]);

    const response = await GET(reqWithUrl("http://test/api/notifier?user=7"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual([{ id: 1, type: "email", origin: "PRIVATE", password: "PRIVATE" }]);
  });

  test("GET forwards all query filters", async () => {
    NotifierService.filterNotifiers.mockResolvedValue([]);

    await GET(reqWithUrl("http://test/api/notifier?user=7&id=3&type=email&origin=gmail&sender=a%40a.com&password=secret"));

    expect(NotifierService.filterNotifiers).toHaveBeenCalledWith({
      id: "3",
      type: "email",
      origin: "gmail",
      sender: "a@a.com",
      password: "secret",
      user: 7,
    });
  });

  test("GET sanitizes notifier query text filters", async () => {
    NotifierService.filterNotifiers.mockResolvedValue([]);

    await GET(reqWithUrl("http://test/api/notifier?user=7&type=email%0A&sender=bot%0Aname"));

    expect(NotifierService.filterNotifiers).toHaveBeenCalledWith({
      type: "email",
      sender: "bot name",
      user: 7,
    });
  });

  test("GET preserves null notifiers from service output", async () => {
    NotifierService.filterNotifiers.mockResolvedValue([null]);

    const response = await GET(reqWithUrl("http://test/api/notifier?user=7"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual([null]);
  });

  test("POST with type sends notification", async () => {
    NotifierCatalog.getClassInfo.mockReturnValue({ type: "MailNotifier", config: "email" });
    NotifierService.filterNotifiers.mockResolvedValue([{ type: "email", origin: "gmail", sender: "a@a.com", password: "p" }]);
    const notifyMock = jest.fn().mockResolvedValue({ result: true, info: "sent" });
    NotifierRegistry.create.mockReturnValue({ notify: notifyMock });

    const response = await POST(reqWithUrl("http://test/api/notifier?type=email&user=7", { receiver: "b@b.com" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toBe("sent");
    expect(notifyMock).toHaveBeenCalledWith({ receiver: "b@b.com" });
  });

  test("POST with type returns 400 when notifier send fails", async () => {
    NotifierCatalog.getClassInfo.mockReturnValue({ type: "MailNotifier", config: "email" });
    NotifierService.filterNotifiers.mockResolvedValue([{ type: "email", origin: "gmail", sender: "a@a.com", password: "p" }]);
    const notifyMock = jest.fn().mockResolvedValue({ result: false, info: "send failed" });
    NotifierRegistry.create.mockReturnValue({ notify: notifyMock });

    const response = await POST(reqWithUrl("http://test/api/notifier?type=email&user=7", { receiver: "b@b.com" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toBe("send failed");
  });

  test("POST with type supports discord runtime config", async () => {
    NotifierCatalog.getClassInfo.mockReturnValue({ type: "DiscordNotifier", config: "discord" });
    NotifierService.filterNotifiers.mockResolvedValue([{ type: "discord", origin: "https://discord/webhook", sender: "bot", password: "unused" }]);
    const notifyMock = jest.fn().mockResolvedValue({ result: true, info: "discord sent" });
    NotifierRegistry.create.mockReturnValue({ notify: notifyMock });

    const response = await POST(reqWithUrl("http://test/api/notifier?type=discord&user=7", { receiver: "user" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toBe("discord sent");
    expect(NotifierRegistry.create).toHaveBeenCalled();
  });

  test("POST with type returns 500 for unsupported notifier type", async () => {
    NotifierCatalog.getClassInfo.mockReturnValue({ type: "CustomNotifier", config: "custom" });
    NotifierService.filterNotifiers.mockResolvedValue([{ type: "custom", origin: "x", sender: "y", password: "z" }]);
    RequestUtils.getErrorStatus.mockImplementationOnce((_error, fallbackStatus = 500) => fallbackStatus);

    const response = await POST(reqWithUrl("http://test/api/notifier?type=custom&user=7", { receiver: "b@b.com" }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toContain("Unsupported notifier type: custom");
  });

  test("POST with type returns 500 when configured notifier is missing", async () => {
    NotifierCatalog.getClassInfo.mockReturnValue({ type: "MailNotifier", config: "email" });
    NotifierService.filterNotifiers.mockResolvedValue([]);
    RequestUtils.getErrorStatus.mockImplementationOnce((_error, fallbackStatus = 500) => fallbackStatus);

    const response = await POST(reqWithUrl("http://test/api/notifier?type=email&user=7", { receiver: "b@b.com" }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toContain("Cannot find configured 'email' notifier.");
  });

  test("POST without type creates notifier and normalizes placeholders", async () => {
    NotifierService.addNotifier.mockResolvedValue({ id: 2, type: "email", origin: "", password: "" });

    const response = await POST(
      reqWithUrl("http://test/api/notifier", { user: 7, type: "email", origin: "PRIVATE", password: "PRIVATE" }),
    );
    const body = await response.json();

    expect(NotifierService.addNotifier).toHaveBeenCalledWith({ user: 7, type: "email", origin: "", password: "" });
    expect(body).toEqual({ id: 2, type: "email", origin: "", password: "" });
  });

  test("POST without type sanitizes non-sensitive fields and preserves credential whitespace", async () => {
    NotifierService.addNotifier.mockResolvedValue({
      id: 5,
      type: "email",
      sender: "bot name",
      origin: " smtp.gmail.com ",
      password: "pa  ss",
    });

    await POST(
      reqWithUrl("http://test/api/notifier", {
        user: 7,
        type: "email\n",
        sender: "bot\nname",
        origin: " smtp.gmail.com ",
        password: "pa  ss",
      }),
    );

    expect(NotifierService.addNotifier).toHaveBeenCalledWith({
      user: 7,
      type: "email",
      sender: "bot name",
      origin: " smtp.gmail.com ",
      password: "pa  ss",
    });
  });

  test("POST without type returns 400 for disallowed control chars in credential fields", async () => {
    const response = await POST(
      reqWithUrl("http://test/api/notifier", {
        user: 7,
        type: "email",
        sender: "bot",
        origin: "smtp\n.gmail.com",
        password: "secret",
      }),
    );
    const body = await response.json();

    expect(NotifierService.addNotifier).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(body.message).toContain("Invalid notifier origin");
  });

  test("PUT returns 404 when notifier does not exist", async () => {
    NotifierService.editNotifierForUser.mockResolvedValue(null);

    const response = await PUT(reqWithUrl("http://test/api/notifier?id=3&user=7", { type: "email" }));

    expect(response.status).toBe(404);
  });

  test("PUT updates notifier and masks sensitive output", async () => {
    NotifierService.editNotifierForUser.mockResolvedValue({
      id: 3,
      type: "email",
      origin: "smtp.gmail.com",
      sender: "sender@test.com",
      password: "new-secret",
    });

    const response = await PUT(reqWithUrl("http://test/api/notifier?id=3&user=7", { type: "email", origin: "PRIVATE" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.origin).toBe("PRIVATE");
    expect(body.password).toBe("PRIVATE");
  });

  test("PUT forwards null payload and returns mapped error status", async () => {
    NotifierService.editNotifierForUser.mockRejectedValueOnce(Object.assign(new Error("invalid notifier payload"), { status: 400 }));

    const response = await PUT(reqWithUrl("http://test/api/notifier?id=3&user=7", null));
    const body = await response.json();

    expect(NotifierService.editNotifierForUser).toHaveBeenCalledWith("3", 7, null);
    expect(response.status).toBe(400);
    expect(body.message).toContain("Cannot update notifier: invalid notifier payload");
  });

  test("DELETE returns deleted notifier count", async () => {
    NotifierService.deleteNotifierForUser.mockResolvedValue(2);

    const response = await DELETE(reqWithUrl("http://test/api/notifier?id=3&user=7"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ message: "Deleted 2 notifier(s)" });
  });
});
