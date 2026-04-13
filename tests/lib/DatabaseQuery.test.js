describe("DatabaseQuery", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test("creates pg pool with app database config and delegates queries", async () => {
    const queryMock = jest.fn().mockResolvedValue({ rows: [{ id: 1 }] });
    const poolMock = jest.fn().mockImplementation(() => ({ query: queryMock }));
    const dotenvConfigMock = jest.fn();

    jest.doMock("pg", () => ({ Pool: poolMock }));
    jest.doMock("dotenv", () => ({ __esModule: true, default: { config: dotenvConfigMock } }));
    jest.doMock("../../src/config/AppConfig.js", () => ({
      AppConfig: {
        getConfig: () => ({
          database: {
            host: "db-host",
            port: 5433,
            name: "db-name",
            user: "db-user",
            password: "db-pass",
          },
        }),
      },
    }));

    process.env.NODE_ENV = "test";

    const { DatabaseQuery } = await import("../../src/lib/DatabaseQuery.js");
    const result = await DatabaseQuery("SELECT 1", ["x"]);

    expect(dotenvConfigMock).toHaveBeenCalledWith({ override: true, quiet: true });
    expect(poolMock).toHaveBeenCalledWith({
      host: "db-host",
      port: 5433,
      database: "db-name",
      user: "db-user",
      password: "db-pass",
    });
    expect(queryMock).toHaveBeenCalledWith("SELECT 1", ["x"]);
    expect(result).toEqual({ rows: [{ id: 1 }] });
  });

  test("DatabaseTransaction commits and returns operation result", async () => {
    const queryMock = jest.fn().mockResolvedValue({ rows: [] });
    const poolMock = jest.fn().mockImplementation(() => ({ query: queryMock }));

    jest.doMock("pg", () => ({ Pool: poolMock }));
    jest.doMock("dotenv", () => ({ __esModule: true, default: { config: jest.fn() } }));
    jest.doMock("../../src/config/AppConfig.js", () => ({
      AppConfig: {
        getConfig: () => ({
          database: {
            host: "db-host",
            port: 5433,
            name: "db-name",
            user: "db-user",
            password: "db-pass",
          },
        }),
      },
    }));

    process.env.NODE_ENV = "test";

    const { DatabaseQuery, DatabaseTransaction } = await import("../../src/lib/DatabaseQuery.js");
    const result = await DatabaseTransaction(async () => {
      await DatabaseQuery("UPDATE x SET y = $1", [1]);
      return 123;
    });

    expect(result).toBe(123);
    expect(queryMock).toHaveBeenNthCalledWith(1, "BEGIN", undefined);
    expect(queryMock).toHaveBeenNthCalledWith(2, "UPDATE x SET y = $1", [1]);
    expect(queryMock).toHaveBeenNthCalledWith(3, "COMMIT", undefined);
  });

  test("DatabaseTransaction rolls back when operation fails", async () => {
    const queryMock = jest.fn().mockResolvedValue({ rows: [] });
    const poolMock = jest.fn().mockImplementation(() => ({ query: queryMock }));

    jest.doMock("pg", () => ({ Pool: poolMock }));
    jest.doMock("dotenv", () => ({ __esModule: true, default: { config: jest.fn() } }));
    jest.doMock("../../src/config/AppConfig.js", () => ({
      AppConfig: {
        getConfig: () => ({
          database: {
            host: "db-host",
            port: 5433,
            name: "db-name",
            user: "db-user",
            password: "db-pass",
          },
        }),
      },
    }));

    process.env.NODE_ENV = "test";

    const { DatabaseQuery, DatabaseTransaction } = await import("../../src/lib/DatabaseQuery.js");
    await expect(
      DatabaseTransaction(async () => {
        await DatabaseQuery("UPDATE x SET y = $1", [2]);
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");

    expect(queryMock).toHaveBeenNthCalledWith(1, "BEGIN", undefined);
    expect(queryMock).toHaveBeenNthCalledWith(2, "UPDATE x SET y = $1", [2]);
    expect(queryMock).toHaveBeenNthCalledWith(3, "ROLLBACK", undefined);
  });
});
