import { GET, POST, PUT, DELETE } from "../../../../src/app/api/monitor/route.js";
import { authorizeUser } from "@/lib/ApiUserAuth";
import { RequestUtils } from "@/lib/RequestUtils";
import { MonitorService } from "@/model/MonitorService";
import { NotifierService } from "@/model/NotifierService";

jest.mock("@/lib/ApiUserAuth", () => ({ authorizeUser: jest.fn() }));
jest.mock("@/lib/RequestUtils", () => ({ RequestUtils: { getErrorStatus: jest.fn() } }));
jest.mock("@/model/MonitorService", () => ({
  MonitorService: {
    filterMonitors: jest.fn(),
    addMonitor: jest.fn(),
    editMonitorForUser: jest.fn(),
    deleteMonitorForUser: jest.fn(),
  },
}));
jest.mock("@/model/NotifierService", () => ({
  NotifierService: { filterNotifiers: jest.fn() },
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

describe("app/api/monitor route", () => {
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

  test("GET filters monitors for authorized user", async () => {
    MonitorService.filterMonitors.mockResolvedValue([{ id: 1 }]);

    const response = await GET(reqWithUrl("http://test/api/monitor?user=7&parent=btc"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual([{ id: 1 }]);
    expect(MonitorService.filterMonitors).toHaveBeenCalledWith({ parent: "btc", user: 7 });
  });

  test("GET forwards all supported query filters", async () => {
    MonitorService.filterMonitors.mockResolvedValue([]);

    await GET(reqWithUrl("http://test/api/monitor?user=7&id=1&parent=btc&enabled=true&threshold=90&condition=%3E&notifier=9&interval=60"));

    expect(MonitorService.filterMonitors).toHaveBeenCalledWith({
      id: "1",
      parent: "btc",
      enabled: "true",
      threshold: "90",
      condition: ">",
      notifier: "9",
      interval: "60",
      user: 7,
    });
  });

  test("POST creates monitor when notifier belongs to user", async () => {
    NotifierService.filterNotifiers.mockResolvedValue([{ id: 9 }]);
    MonitorService.addMonitor.mockResolvedValue({ id: 12 });

    const response = await POST(reqWithUrl("http://test/api/monitor", { user: 7, notifier: 9, parent: "btc" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ id: 12 });
    expect(NotifierService.filterNotifiers).toHaveBeenCalledWith({ id: 9, user: 7 });
    expect(MonitorService.addMonitor).toHaveBeenCalledWith({ user: 7, notifier: 9, parent: "btc" });
  });

  test("POST returns 400 for invalid notifier id", async () => {
    const response = await POST(reqWithUrl("http://test/api/monitor", { user: 7, notifier: "bad", parent: "btc" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toContain("Invalid monitor notifier ID.");
  });

  test("POST returns 403 when notifier does not belong to authorized user", async () => {
    NotifierService.filterNotifiers.mockResolvedValueOnce([]);

    const response = await POST(reqWithUrl("http://test/api/monitor", { user: 7, notifier: 9, parent: "btc" }));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.message).toContain("Selected notifier does not belong to the authorized user.");
  });

  test("POST skips notifier ownership validation when notifier id is missing", async () => {
    MonitorService.addMonitor.mockResolvedValue({ id: 15, parent: "eth" });

    const response = await POST(reqWithUrl("http://test/api/monitor", { user: 7, parent: "eth" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ id: 15, parent: "eth" });
    expect(NotifierService.filterNotifiers).not.toHaveBeenCalled();
  });

  test("PUT returns 404 when monitor does not exist for user", async () => {
    NotifierService.filterNotifiers.mockResolvedValue([{ id: 9 }]);
    MonitorService.editMonitorForUser.mockResolvedValue(null);

    const response = await PUT(reqWithUrl("http://test/api/monitor?id=1&user=7", { notifier: 9 }));
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body.message).toContain("Monitor not found");
  });

  test("PUT updates monitor for authorized user", async () => {
    NotifierService.filterNotifiers.mockResolvedValue([{ id: 9 }]);
    MonitorService.editMonitorForUser.mockResolvedValue({ id: 1, notifier: 9, parent: "btc" });

    const response = await PUT(reqWithUrl("http://test/api/monitor?id=1&user=7", { notifier: 9, parent: "btc" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ id: 1, notifier: 9, parent: "btc" });
  });

  test("DELETE returns deleted monitor count", async () => {
    MonitorService.deleteMonitorForUser.mockResolvedValue(1);

    const response = await DELETE(reqWithUrl("http://test/api/monitor?id=1&user=7"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ message: "Deleted 1 monitor(s)" });
  });

  test("returns mapped error status on route errors", async () => {
    authorizeUser.mockRejectedValueOnce(Object.assign(new Error("forbidden"), { status: 403 }));
    RequestUtils.getErrorStatus.mockReturnValueOnce(403);

    const response = await GET(reqWithUrl("http://test/api/monitor?user=7"));

    expect(response.status).toBe(403);
  });
});
