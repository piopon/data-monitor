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

  test("does not retry idempotent request on non-retryable status", async () => {
    global.fetch.mockResolvedValueOnce(makeResponse({ status: 404, text: "not found" }));

    const response = await RequestUtils.fetchWithRetry("/api/test", { method: "GET" }, { timeout: 50, retries: 2, retryDelay: 0 });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(404);
  });

  test("retries after abort error and succeeds", async () => {
    const abortError = new Error("aborted");
    abortError.name = "AbortError";

    global.fetch
      .mockRejectedValueOnce(abortError)
      .mockResolvedValueOnce(makeResponse({ status: 200, text: "ok" }));

    const response = await RequestUtils.fetchWithRetry("/api/test", { method: "GET" }, { timeout: 10, retries: 1, retryDelay: 0 });

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(response.status).toBe(200);
  });

  test("does not retry non-idempotent methods on failure", async () => {
    global.fetch.mockRejectedValueOnce(new Error("network down"));

    await expect(
      RequestUtils.fetchWithRetry("/api/test", { method: "POST" }, { timeout: 50, retries: 2, retryDelay: 0 }),
    ).rejects.toThrow("network down");

    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test("uses fallback when getErrorStatus receives non-integer status", () => {
    expect(RequestUtils.getErrorStatus({ status: "500" }, 409)).toBe(409);
  });

  test("getRequestRetryConfig falls back to defaults for non-numeric env values", () => {
    process.env.REQUEST_TIMEOUT = "abc";
    process.env.REQUEST_RETRIES = "nan";
    process.env.REQUEST_RETRY_DELAY = "invalid-delay";

    const config = RequestUtils.getRequestRetryConfig();

    expect(config).toEqual({ timeout: 8000, retries: 2, retryDelay: 250 });
  });

  test("cancels unlocked response body before retrying", async () => {
    const cancelMock = jest.fn(async () => {});
    global.fetch
      .mockResolvedValueOnce({ status: 500, ok: false, body: { locked: false, cancel: cancelMock } })
      .mockResolvedValueOnce(makeResponse({ status: 200, text: "ok" }));

    const response = await RequestUtils.fetchWithRetry("/api/test", { method: "GET" }, { timeout: 50, retries: 1, retryDelay: 0 });

    expect(cancelMock).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
  });

  test("drains response via arrayBuffer when body stream is unavailable", async () => {
    const arrayBufferMock = jest.fn(async () => new ArrayBuffer(0));
    global.fetch
      .mockResolvedValueOnce({ status: 500, ok: false, arrayBuffer: arrayBufferMock })
      .mockResolvedValueOnce(makeResponse({ status: 200, text: "ok" }));

    const response = await RequestUtils.fetchWithRetry("/api/test", { method: "GET" }, { timeout: 50, retries: 1, retryDelay: 0 });

    expect(arrayBufferMock).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
  });

  test("retries GET request on generic error and then succeeds", async () => {
    global.fetch
      .mockRejectedValueOnce(new Error("temporary network issue"))
      .mockResolvedValueOnce(makeResponse({ status: 200, text: "ok" }));

    const response = await RequestUtils.fetchWithRetry("/api/test", {}, { timeout: 50, retries: 1, retryDelay: 0 });

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(response.status).toBe(200);
  });

  test("sanitizes retry warning log message content", async () => {
    global.fetch
      .mockRejectedValueOnce(new Error("temporary\nnetwork\tissue"))
      .mockResolvedValueOnce(makeResponse({ status: 200, text: "ok" }));

    await RequestUtils.fetchWithRetry("/api/test", {}, { timeout: 50, retries: 1, retryDelay: 0 });

    expect(warnSpy).toHaveBeenCalled();
    const firstWarnArg = String(warnSpy.mock.calls[0][0]);
    expect(firstWarnArg).toContain("temporary network issue");
    expect(firstWarnArg).not.toContain("\n");
    expect(firstWarnArg).not.toContain("\t");
  });

  test("returns final retryable response when retry budget is exhausted", async () => {
    global.fetch
      .mockResolvedValueOnce(makeResponse({ status: 503, text: "retry-1" }))
      .mockResolvedValueOnce(makeResponse({ status: 503, text: "retry-2" }));

    const response = await RequestUtils.fetchWithRetry("/api/test", { method: "GET" }, { timeout: 50, retries: 1, retryDelay: 0 });

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(response.status).toBe(503);
  });

  test("getResponseMessage returns JSON string payload", async () => {
    const response = {
      text: jest.fn(async () => '"plain message"'),
    };

    const message = await RequestUtils.getResponseMessage(response);

    expect(message).toBe("plain message");
    expect(response.text).toHaveBeenCalledTimes(1);
  });

  test("getResponseMessage returns message field from JSON payload", async () => {
    const response = {
      text: jest.fn(async () => '{"message":"bad request"}'),
    };

    const message = await RequestUtils.getResponseMessage(response);

    expect(message).toBe("bad request");
    expect(response.text).toHaveBeenCalledTimes(1);
  });

  test("getResponseMessage stringifies JSON payload without message field", async () => {
    const response = {
      text: jest.fn(async () => '{"error":"boom","code":123}'),
    };

    const message = await RequestUtils.getResponseMessage(response);

    expect(message).toBe('{"error":"boom","code":123}');
    expect(response.text).toHaveBeenCalledTimes(1);
  });

  test("getResponseMessage returns raw text when JSON parsing fails", async () => {
    const response = {
      text: jest.fn(async () => "service unavailable"),
    };

    const message = await RequestUtils.getResponseMessage(response);

    expect(message).toBe("service unavailable");
    expect(response.text).toHaveBeenCalledTimes(1);
  });

  test("getResponseMessage returns empty string for empty response body", async () => {
    const response = {
      text: jest.fn(async () => ""),
    };

    const message = await RequestUtils.getResponseMessage(response);

    expect(message).toBe("");
    expect(response.text).toHaveBeenCalledTimes(1);
  });

  test("getResponseMessage returns default fallback when text parsing fails", async () => {
    const response = {
      text: jest.fn(async () => {
        throw new Error("text stream failed");
      }),
    };

    const message = await RequestUtils.getResponseMessage(response);

    expect(message).toBe("No response details available.");
    expect(response.text).toHaveBeenCalledTimes(1);
  });
});
