import { render, screen } from "@testing-library/react";

import Home from "../../src/app/page.js";

jest.mock("@/components/GuestAccess", () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="guest-access">{children}</div>,
}));

jest.mock("@/views/HomePage", () => ({
  __esModule: true,
  default: ({ demoEnabled, initError }) => (
    <div data-testid="home-page">
      demo:{String(demoEnabled)}|error:{initError || ""}
    </div>
  ),
}));

describe("app/page", () => {
  const originalEnv = { ...process.env };
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env = { ...originalEnv };
    global.fetch = jest.fn();
  });

  afterAll(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  test("renders home without init call when INIT_ON_START is disabled", async () => {
    process.env.INIT_ON_START = "false";

    render(await Home());

    expect(global.fetch).not.toHaveBeenCalled();
    expect(screen.getByTestId("home-page")).toHaveTextContent("demo:false|error:");
  });

  test("uses init endpoint response when INIT_ON_START is enabled", async () => {
    process.env.INIT_ON_START = "true";
    process.env.SERVER_URL = "localhost";
    process.env.SERVER_PORT = "3000";

    global.fetch.mockResolvedValueOnce({
      json: async () => ({ demo: true, init: false, message: "init failed" }),
    });

    render(await Home());

    expect(global.fetch).toHaveBeenCalledWith("http://localhost:3000/api/init", { cache: "no-store" });
    expect(screen.getByTestId("home-page")).toHaveTextContent("demo:true|error:init failed");
  });

  test("returns default init error when init endpoint is unreachable", async () => {
    process.env.INIT_ON_START = "true";

    global.fetch.mockRejectedValueOnce(new Error("connection refused"));

    render(await Home());

    expect(screen.getByTestId("home-page")).toHaveTextContent("demo:false|error:Cannot reach initialization endpoint.");
  });

  test("uses PORT fallback and default initialization error message", async () => {
    process.env.INIT_ON_START = "on";
    delete process.env.SERVER_PORT;
    process.env.PORT = "3111";
    process.env.SERVER_URL = "127.0.0.1";

    global.fetch.mockResolvedValueOnce({
      json: async () => ({ demo: true, init: false }),
    });

    render(await Home());

    expect(global.fetch).toHaveBeenCalledWith("http://127.0.0.1:3111/api/init", { cache: "no-store" });
    expect(screen.getByTestId("home-page")).toHaveTextContent("demo:true|error:Initialization failed.");
  });

  test("uses default host and port when server env values are missing", async () => {
    process.env.INIT_ON_START = "yes";
    delete process.env.SERVER_URL;
    delete process.env.SERVER_PORT;
    delete process.env.PORT;

    global.fetch.mockResolvedValueOnce({
      json: async () => ({ demo: false, init: true, message: "ok" }),
    });

    render(await Home());

    expect(global.fetch).toHaveBeenCalledWith("http://127.0.0.1:3000/api/init", { cache: "no-store" });
    expect(screen.getByTestId("home-page")).toHaveTextContent("demo:false|error:");
  });
});
