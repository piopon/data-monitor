import { getAppVersion } from "@/lib/AppVersion";
import { GET, HEAD } from "../../../../src/app/api/health/route.js";

jest.mock("@/lib/AppVersion", () => ({
  getAppVersion: jest.fn(),
}));

class MockResponse {
  constructor(body, init = {}) {
    this._body = body;
    this.status = init.status ?? 200;
    const headerMap = {};
    Object.entries(init.headers || {}).forEach(([key, value]) => {
      headerMap[String(key).toLowerCase()] = value;
    });
    this.headers = {
      get: (name) => headerMap[String(name).toLowerCase()] ?? null,
    };
  }

  async text() {
    return this._body == null ? "" : String(this._body);
  }

  async json() {
    return JSON.parse(await this.text());
  }
}

describe("app/api/health route", () => {
  const originalResponse = global.Response;

  beforeAll(() => {
    global.Response = MockResponse;
  });

  afterAll(() => {
    global.Response = originalResponse;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET returns service health payload with headers", async () => {
    jest.spyOn(process, "uptime").mockReturnValueOnce(123.9);
    getAppVersion.mockReturnValueOnce("1.2.3+abc");

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/json");
    expect(response.headers.get("cache-control")).toBe("no-store");

    expect(body.status).toBe("ok");
    expect(body.service).toBe("data-monitor");
    expect(body.version).toBe("1.2.3+abc");
    expect(body.uptimeSeconds).toBe(123);
    expect(new Date(body.timestamp).toString()).not.toBe("Invalid Date");
    expect(getAppVersion).toHaveBeenCalledWith({ verbose: false });
  });

  test("HEAD returns no-store cache header", async () => {
    const response = await HEAD();

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});
