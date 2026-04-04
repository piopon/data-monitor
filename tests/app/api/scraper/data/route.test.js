import { GET } from "../../../../../src/app/api/scraper/data/route.js";
import { AppConfig } from "@/config/AppConfig";
import { ScraperRequest } from "@/lib/ScraperRequest";

jest.mock("@/config/AppConfig", () => ({
  AppConfig: { getConfig: jest.fn() },
}));
jest.mock("@/lib/ScraperRequest", () => ({
  ScraperRequest: { GET: jest.fn() },
}));

describe("app/api/scraper/data route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AppConfig.getConfig.mockReturnValue({ scraper: { endpoints: { data: "/api/v1/data" } } });
  });

  test("forwards GET call to scraper endpoint with authorization header", async () => {
    const responseMock = { ok: true };
    ScraperRequest.GET.mockResolvedValue(responseMock);
    const request = { headers: { get: jest.fn(() => "Bearer x") } };

    const response = await GET(request);

    expect(response).toBe(responseMock);
    expect(ScraperRequest.GET).toHaveBeenCalledWith("/api/v1/data", { Authorization: "Bearer x" });
  });
});
