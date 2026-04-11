jest.mock("node:fs/promises", () => ({
  __esModule: true,
  default: { readFile: jest.fn() },
  readFile: jest.fn(),
}));

import fs from "node:fs/promises";
import { OpenApiBundler } from "../../src/lib/OpenApiBundler.js";

const mockReadFile = fs.readFile;

describe("OpenApiBundler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getErrorMessage returns message for Error instances", () => {
    expect(OpenApiBundler.getErrorMessage(new Error("boom"))).toBe("boom");
  });

  test("getErrorMessage normalizes nullish and primitive errors", () => {
    expect(OpenApiBundler.getErrorMessage(null)).toBe("Unknown error");
    expect(OpenApiBundler.getErrorMessage(undefined)).toBe("Unknown error");
    expect(OpenApiBundler.getErrorMessage("broken")).toBe("broken");
    expect(OpenApiBundler.getErrorMessage(42)).toBe("42");
  });

  test("bundleFromFile resolves local and pointer refs", async () => {
    const rootFile = "openapi/openapi.json";

    mockReadFile.mockImplementation(async (requestedPath) => {
      const normalized = String(requestedPath).replace(/\\/g, "/");
      if (normalized.endsWith("openapi/openapi.json")) {
        return JSON.stringify({
          openapi: "3.1.0",
          info: { title: "data-monitor", version: "0.1.0" },
          components: {
            schemas: {
              HealthResponse: { $ref: "./components/schemas/health.json" },
            },
          },
          paths: {
            "/api/health": { $ref: "./paths/api-health.json" },
          },
        });
      }
      if (normalized.endsWith("openapi/components/schemas/health.json")) {
        return JSON.stringify({
          type: "object",
          properties: {
            status: { type: "string" },
          },
          required: ["status"],
        });
      }
      if (normalized.endsWith("openapi/paths/api-health.json")) {
        return JSON.stringify({
          get: {
            responses: {
              "200": {
                description: "ok",
                content: {
                  "application/json": {
                    schema: { $ref: "#/components/schemas/HealthResponse" },
                  },
                },
              },
            },
          },
        });
      }
      throw new Error(`Unexpected readFile path: ${normalized}`);
    });

    const bundled = await OpenApiBundler.bundleFromFile(rootFile);

    expect(bundled.openapi).toBe("3.1.0");
    expect(bundled.components.schemas.HealthResponse).toEqual({
      type: "object",
      properties: { status: { type: "string" } },
      required: ["status"],
    });
    expect(bundled.paths["/api/health"].get.responses["200"].content["application/json"].schema).toEqual({
      type: "object",
      properties: { status: { type: "string" } },
      required: ["status"],
    });
  });

  test("bundleFromFile throws for unsupported ref values", async () => {
    const rootFile = "openapi/openapi.json";

    mockReadFile.mockResolvedValueOnce(
      JSON.stringify({
        openapi: "3.1.0",
        info: { title: "data-monitor", version: "0.1.0" },
        paths: {
          "/api/health": {
            $ref: "https://example.com/external.json",
          },
        },
      })
    );

    await expect(OpenApiBundler.bundleFromFile(rootFile)).rejects.toThrow(
      "Unsupported $ref value: https://example.com/external.json"
    );
  });
});
