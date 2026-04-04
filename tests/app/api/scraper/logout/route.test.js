import { POST } from "../../../../../src/app/api/scraper/logout/route.js";
import { AppConfig } from "@/config/AppConfig";
import { ScraperRequest } from "@/lib/ScraperRequest";

jest.mock("@/config/AppConfig", () => ({
  AppConfig: { getConfig: jest.fn() },
}));
jest.mock("@/lib/ScraperRequest", () => ({
  ScraperRequest: { POST: jest.fn() },
}));

describe("app/api/scraper/logout route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AppConfig.getConfig.mockReturnValue({ scraper: { endpoints: { logout: "/auth/logout" } } });
  });

  test("forwards logout payload to scraper endpoint", async () => {
    const responseMock = { ok: true };
    ScraperRequest.POST.mockResolvedValue(responseMock);

    const response = await POST({ json: async () => ({ token: "jwt" }) });

    expect(response).toBe(responseMock);
    expect(ScraperRequest.POST).toHaveBeenCalledWith(
      "/auth/logout",
      { "Content-Type": "application/json" },
      JSON.stringify({ token: "jwt" }),
    );
  });
});
