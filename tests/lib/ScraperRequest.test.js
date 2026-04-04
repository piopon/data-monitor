import { ScraperRequest } from "../../src/lib/ScraperRequest.js";

class MockResponse {
  constructor(body = "", init = {}) {
    this._body = String(body);
    this.status = init.status ?? 200;
    this.ok = this.status >= 200 && this.status < 300;
    const inputHeaders = init.headers || {};
    const normalized = Object.fromEntries(Object.entries(inputHeaders).map(([k, v]) => [String(k).toLowerCase(), v]));
    this.headers = {
      get: (name) => normalized[String(name).toLowerCase()] ?? null,
    };
  }

  async text() {
    return this._body;
  }

  async json() {
    return JSON.parse(this._body);
  }
}

describe("ScraperRequest", () => {
  const originalFetch = global.fetch;
  const originalResponse = global.Response;

  beforeEach(() => {
    global.fetch = jest.fn();
    global.Response = MockResponse;
  });

  afterAll(() => {
    global.fetch = originalFetch;
    global.Response = originalResponse;
  });

  test("GET proxies JSON response with same status", async () => {
    global.fetch.mockResolvedValueOnce(
      new MockResponse(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    const response = await ScraperRequest.GET("/items", { Authorization: "Bearer x" });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/items"),
      expect.objectContaining({ method: "GET", headers: { Authorization: "Bearer x" } }),
    );
    expect(response.status).toBe(200);
    expect(await response.text()).toBe(JSON.stringify({ ok: true }));
  });

  test("POST handles non-ok quoted JSON text content", async () => {
    global.fetch.mockResolvedValueOnce(
      new MockResponse('"invalid credentials"', {
        status: 401,
        headers: { "content-type": "application/json" },
      }),
    );

    const response = await ScraperRequest.POST("/login", { "Content-Type": "application/json" }, "{}");

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/login"),
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      }),
    );
    expect(response.status).toBe(401);
    expect(await response.text()).toBe("invalid credentials");
  });

  test("returns 500 fallback response when fetch throws", async () => {
    global.fetch.mockRejectedValueOnce(new Error("connection refused"));

    const response = await ScraperRequest.GET("/items", {});

    expect(response.status).toBe(500);
    expect(await response.text()).toBe("Scraper backend is not available");
  });
});
