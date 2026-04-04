import { RequestUtils } from "../../src/lib/RequestUtils.js";

function makeResponse({ status, text = "", headers = {} }) {
  const normalizedHeaders = Object.fromEntries(Object.entries(headers).map(([k, v]) => [String(k).toLowerCase(), v]));
  return {
    status,
    ok: status >= 200 && status < 300,
    headers: {
      get: (name) => normalizedHeaders[String(name).toLowerCase()] ?? null,
    },
    body: { locked: true },
    text: jest.fn(async () => text),
    arrayBuffer: jest.fn(async () => new TextEncoder().encode(text).buffer),
  };
}

describe("RequestUtils", () => {
  const originalEnv = { ...process.env };
  const originalFetch = global.fetch;
  let warnSpy;

  beforeEach(() => {
    process.env = { ...originalEnv };
    global.fetch = jest.fn();
    warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterAll(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  test("buildUrl encodes query parameters and omits nullish entries", () => {
    const url = RequestUtils.buildUrl("/api/test", { a: 1, b: "x y", c: null, d: undefined });
    expect(url).toBe("/api/test?a=1&b=x%20y");
  });

  test("returns base URL when there are no query params", () => {
    expect(RequestUtils.buildUrl("/api/test")).toBe("/api/test");
  });

  test("getErrorStatus reads status from error or fallback", () => {
    expect(RequestUtils.getErrorStatus({ status: 422 }, 400)).toBe(422);
    expect(RequestUtils.getErrorStatus({}, 401)).toBe(401);
  });

  test("getRequestRetryConfig applies numeric parsing and minimums", () => {
    process.env.REQUEST_TIMEOUT = "500";
    process.env.REQUEST_RETRIES = "3.8";
    process.env.REQUEST_RETRY_DELAY = "50";

    const config = RequestUtils.getRequestRetryConfig();

    expect(config).toEqual({ timeout: 1000, retries: 3, retryDelay: 100 });
  });

  test("retries GET requests on retryable status and eventually succeeds", async () => {
    global.fetch
      .mockResolvedValueOnce(makeResponse({ status: 500, text: "temporary" }))
      .mockResolvedValueOnce(makeResponse({ status: 200, text: "ok" }));

    const response = await RequestUtils.fetchWithRetry("/api/test", { method: "GET" }, { timeout: 50, retries: 1, retryDelay: 0 });

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("ok");
  });

  test("does not retry non-idempotent methods on failure", async () => {
    global.fetch.mockRejectedValueOnce(new Error("network down"));

    await expect(
      RequestUtils.fetchWithRetry("/api/test", { method: "POST" }, { timeout: 50, retries: 2, retryDelay: 0 }),
    ).rejects.toThrow("network down");

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
