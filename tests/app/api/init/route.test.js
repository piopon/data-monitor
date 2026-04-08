import { GET } from "../../../../src/app/api/init/route.js";
import { AppConfig } from "@/config/AppConfig";
import { DataCrypto } from "@/lib/DataCrypto";
import { ScraperRequest } from "@/lib/ScraperRequest";
import { RequestUtils } from "@/lib/RequestUtils";
import { MonitorService } from "@/model/MonitorService";
import { NotifierService } from "@/model/NotifierService";
import { UserService } from "@/model/UserService";

jest.mock("@/config/AppConfig", () => ({
  AppConfig: { getConfig: jest.fn() },
}));
jest.mock("@/lib/DataCrypto", () => ({
  DataCrypto: { assertConfigured: jest.fn() },
}));
jest.mock("@/lib/ScraperRequest", () => ({
  ScraperRequest: { GET: jest.fn() },
}));
jest.mock("@/lib/RequestUtils", () => ({
  RequestUtils: { getErrorStatus: jest.fn(), getResponseMessage: jest.fn() },
}));
jest.mock("@/model/MonitorService", () => ({
  MonitorService: { initializeTable: jest.fn() },
}));
jest.mock("@/model/NotifierService", () => ({
  NotifierService: { initializeTable: jest.fn(), migrateSensitiveData: jest.fn() },
}));
jest.mock("@/model/UserService", () => ({
  UserService: { initializeTable: jest.fn(), migrateSensitiveData: jest.fn() },
}));

class MockResponse {
  constructor(body, init = {}) {
    this._body = body;
    this.status = init.status ?? 200;
    const map = Object.fromEntries(Object.entries(init.headers || {}).map(([k, v]) => [String(k).toLowerCase(), v]));
    this.headers = { get: (name) => map[String(name).toLowerCase()] ?? null };
    this.ok = this.status >= 200 && this.status < 300;
  }
  async json() {
    return JSON.parse(this._body || "null");
  }
  async text() {
    return this._body == null ? "" : String(this._body);
  }
}

describe("app/api/init route", () => {
  const originalResponse = global.Response;

  beforeAll(() => {
    global.Response = MockResponse;
  });

  afterAll(() => {
    global.Response = originalResponse;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    AppConfig.getConfig.mockReturnValue({ scraper: { endpoints: { features: "/features" } } });
    UserService.initializeTable.mockResolvedValue({ result: true });
    NotifierService.initializeTable.mockResolvedValue({ result: true });
    MonitorService.initializeTable.mockResolvedValue({ result: true });
    UserService.migrateSensitiveData.mockResolvedValue(1);
    NotifierService.migrateSensitiveData.mockResolvedValue(2);
    RequestUtils.getResponseMessage.mockResolvedValue("features down");
  });

  test("returns initialized features payload on success", async () => {
    ScraperRequest.GET.mockResolvedValue({ ok: true, json: async () => ({ featureA: true }) });

    const response = await GET({});
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ featureA: true, init: true, message: "Database initialized correctly." });
    expect(ScraperRequest.GET).toHaveBeenCalledWith("/features");
  });

  test("returns 500 when user table init fails", async () => {
    UserService.initializeTable.mockResolvedValueOnce({ result: false, message: "user init failed" });

    const response = await GET({});
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ init: false, message: "user init failed" });
  });

  test("returns 500 when notifier table init fails", async () => {
    NotifierService.initializeTable.mockResolvedValueOnce({ result: false, message: "notifier init failed" });

    const response = await GET({});
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ init: false, message: "notifier init failed" });
  });

  test("returns 500 when monitor table init fails", async () => {
    MonitorService.initializeTable.mockResolvedValueOnce({ result: false, message: "monitor init failed" });

    const response = await GET({});
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ init: false, message: "monitor init failed" });
  });

  test("returns scraper feature endpoint error status when feature call is non-ok", async () => {
    ScraperRequest.GET.mockResolvedValueOnce({
      ok: false,
      status: 502,
      text: async () => "features down",
    });

    const response = await GET({});
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body).toEqual({ init: false, message: "features down" });
    expect(RequestUtils.getResponseMessage).toHaveBeenCalledTimes(1);
  });

  test("returns mapped error status on thrown exception", async () => {
    NotifierService.initializeTable.mockRejectedValueOnce(new Error("db down"));
    RequestUtils.getErrorStatus.mockReturnValueOnce(503);

    const response = await GET({});
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.message).toContain("Cannot initialize application: db down");
    expect(RequestUtils.getErrorStatus).toHaveBeenCalled();
  });
});
