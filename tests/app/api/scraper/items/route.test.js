import { GET } from "../../../../../src/app/api/scraper/items/route.js";
import { AppConfig } from "@/config/AppConfig";
import { ScraperRequest } from "@/lib/ScraperRequest";

jest.mock("@/config/AppConfig", () => ({
  AppConfig: { getConfig: jest.fn() },
}));
jest.mock("@/lib/ScraperRequest", () => ({
  ScraperRequest: { GET: jest.fn() },
}));

describe("app/api/scraper/items route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AppConfig.getConfig.mockReturnValue({ scraper: { endpoints: { items: "/api/v1/data/items" } } });
  });

  test("forwards endpoint without name when name filter is absent", async () => {
    const responseMock = { ok: true };
    ScraperRequest.GET.mockResolvedValue(responseMock);
    const request = {
      nextUrl: new URL("http://test/api/scraper/items"),
      headers: { get: jest.fn(() => "Bearer x") },
    };

    const response = await GET(request);

    expect(response).toBe(responseMock);
    expect(ScraperRequest.GET).toHaveBeenCalledWith("/api/v1/data/items", { Authorization: "Bearer x" });
  });

  test("adds encoded name filter when provided", async () => {
    ScraperRequest.GET.mockResolvedValue({ ok: true });
    const request = {
      nextUrl: new URL("http://test/api/scraper/items?name=btc/usd"),
      headers: { get: jest.fn(() => "Bearer x") },
    };

    await GET(request);

    expect(ScraperRequest.GET).toHaveBeenCalledWith("/api/v1/data/items?name=btc%2Fusd", {
      Authorization: "Bearer x",
    });
  });
});
