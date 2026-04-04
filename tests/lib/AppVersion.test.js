jest.mock("node:child_process", () => ({
  execSync: jest.fn(),
}));

jest.mock("node:fs", () => ({
  readFileSync: jest.fn(),
}));

describe("AppVersion", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.GIT_COMMIT_SHA;
    delete process.env.COMMIT_SHA;
    delete process.env.SOURCE_VERSION;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test("uses package version with git sha when available", async () => {
    const { execSync } = await import("node:child_process");
    const { readFileSync } = await import("node:fs");

    execSync.mockReturnValueOnce(Buffer.from("abc123def456\n"));
    readFileSync.mockImplementation((filePath) => {
      if (String(filePath).endsWith("package.json")) {
        return JSON.stringify({ version: "1.2.3" });
      }
      return "0.0.0";
    });

    const infoSpy = jest.spyOn(console, "info").mockImplementation(() => {});
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    const { getAppVersion } = await import("../../src/lib/AppVersion.js");
    const version = getAppVersion();

    expect(version).toBe("1.2.3+abc123def456");
    expect(infoSpy).toHaveBeenCalledWith("App version: 1.2.3+abc123def456");
    expect(warnSpy).not.toHaveBeenCalled();

    infoSpy.mockRestore();
    warnSpy.mockRestore();
  });

  test("falls back to VERSION file when git sha is unavailable", async () => {
    const { execSync } = await import("node:child_process");
    const { readFileSync } = await import("node:fs");

    execSync.mockImplementation(() => {
      throw new Error("git missing");
    });
    readFileSync.mockImplementation((filePath) => {
      if (String(filePath).endsWith("package.json")) {
        return JSON.stringify({ version: "1.2.3" });
      }
      if (String(filePath).endsWith("VERSION")) {
        return "2.0.0\n";
      }
      return "";
    });

    const { getAppVersion } = await import("../../src/lib/AppVersion.js");
    const version = getAppVersion({ verbose: false });

    expect(version).toBe("2.0.0");
  });

  test("falls back to package version when git and VERSION file are unavailable", async () => {
    const { execSync } = await import("node:child_process");
    const { readFileSync } = await import("node:fs");

    execSync.mockImplementation(() => {
      throw new Error("git missing");
    });
    readFileSync.mockImplementation((filePath) => {
      if (String(filePath).endsWith("package.json")) {
        return JSON.stringify({ version: "1.2.3" });
      }
      throw new Error("missing file");
    });

    const { getAppVersion, getAppVersionDetails } = await import("../../src/lib/AppVersion.js");
    const version = getAppVersion({ verbose: false });
    const details = getAppVersionDetails({ verbose: false });

    expect(version).toBe("1.2.3");
    expect(details).toEqual({
      value: "1.2.3",
      packageVersion: "1.2.3",
      hasSha: false,
      sha: "unknown",
    });
  });
});
