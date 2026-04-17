jest.mock("node:fs/promises", () => ({
  __esModule: true,
  default: {
    readFile: jest.fn(),
  },
  readFile: jest.fn(),
}));

import fs from "node:fs/promises";
import { authorizeUser } from "@/lib/ApiUserAuth";
import { GET } from "../../../../../src/app/api/docs/openapi.json/route.js";

jest.mock("@/lib/ApiUserAuth", () => ({ authorizeUser: jest.fn() }));

const mockReadFile = fs.readFile;

const reqWithUrl = (url) => ({
  nextUrl: new URL(url),
  headers: {
    get: jest.fn(() => null),
  },
});

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

describe("app/api/docs/openapi.json route", () => {
  const originalResponse = global.Response;

  beforeAll(() => {
    global.Response = MockResponse;
  });

  afterAll(() => {
    global.Response = originalResponse;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    authorizeUser.mockResolvedValue(1);
  });

  test("GET returns bundled OpenAPI document", async () => {
    mockReadFile.mockResolvedValueOnce(
      JSON.stringify({
        openapi: "3.1.0",
        info: { title: "data-monitor", version: "0.1.0" },
        paths: {},
        components: {},
      })
    );

    const response = await GET(reqWithUrl("http://test/api/docs/openapi.json?user=1"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(body.openapi).toBe("3.1.0");
  });

  test("GET returns 500 with stable error payload when OpenAPI cannot be parsed", async () => {
    mockReadFile.mockResolvedValueOnce("{ invalid-json }");

    const response = await GET(reqWithUrl("http://test/api/docs/openapi.json?user=1"));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toHaveProperty("message");
    expect(body.message).toContain("Cannot load OpenAPI specification:");
  });

  test("GET normalizes non-Error thrown values", async () => {
    mockReadFile.mockRejectedValueOnce(null);

    const response = await GET(reqWithUrl("http://test/api/docs/openapi.json?user=1"));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toBe("Cannot load OpenAPI specification: Unknown error");
  });

  test("GET returns auth error message directly for authorization failures", async () => {
    const error = new Error("Missing or invalid authorization header.");
    error.status = 401;
    authorizeUser.mockRejectedValueOnce(error);

    const response = await GET(reqWithUrl("http://test/api/docs/openapi.json?user=1"));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.message).toBe("Missing or invalid authorization header.");
  });
});
