import { POST } from "../../../../../src/app/api/scraper/login/route.js";
import { AppConfig } from "@/config/AppConfig";
import { ScraperRequest } from "@/lib/ScraperRequest";

jest.mock("@/config/AppConfig", () => ({
  AppConfig: { getConfig: jest.fn() },
}));
jest.mock("@/lib/ScraperRequest", () => ({
  ScraperRequest: { POST: jest.fn() },
}));

describe("app/api/scraper/login route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AppConfig.getConfig.mockReturnValue({ scraper: { endpoints: { login: "/auth/token" } } });
  });

  test("forwards login payload to scraper endpoint", async () => {
    const responseMock = { ok: true };
    ScraperRequest.POST.mockResolvedValue(responseMock);

    const response = await POST({ json: async () => ({ email: "u@test.com", password: "p" }) });

    expect(response).toBe(responseMock);
    expect(ScraperRequest.POST).toHaveBeenCalledWith(
      "/auth/token",
      { "Content-Type": "application/json" },
      JSON.stringify({ email: "u@test.com", password: "p" }),
    );
  });
});
