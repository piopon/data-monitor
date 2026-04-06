import { Pool } from "pg";

import { DataCrypto } from "../../src/lib/DataCrypto.js";
import { UserService } from "../../src/model/UserService.js";

if (!process.env.CRYPTO_SECRET) {
  process.env.CRYPTO_SECRET = "this-is-a-test-secret-min-16";
}

async function withMockedQuery(handler, callback) {
  const originalQuery = Pool.prototype.query;
  const calls = [];
  Pool.prototype.query = async function query(text, params) {
    calls.push({ text, params });
    return handler(text, params, calls.length - 1);
  };

  try {
    await callback(calls);
  } finally {
    Pool.prototype.query = originalQuery;
  }
}

describe("UserService", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("initializeTable returns success and failure results", async () => {
    await withMockedQuery(
      async () => ({ rows: [] }),
      async () => {
        const result = await UserService.initializeTable();
        expect(result.result).toBe(true);
      },
    );

    await withMockedQuery(
      async () => {
        throw new Error("db error");
      },
      async () => {
        const result = await UserService.initializeTable();
        expect(result.result).toBe(false);
        expect(result.message).toContain("db error");
      },
    );
  });

  test("handles encrypted jwt and guardrails", async () => {
    await withMockedQuery(
      async (_text, _params, callIndex) => {
        if (callIndex === 0) {
          return { rows: [{ id: 1, email: "a@a.com", jwt: DataCrypto.encrypt("jwt-1") }] };
        }
        if (callIndex === 1) {
          return { rows: [{ id: 2, email: "b@b.com", jwt: DataCrypto.encrypt("jwt-2") }] };
        }
        if (callIndex === 2) {
          return { rows: [{ jwt: DataCrypto.encrypt("current-jwt") }] };
        }
        if (callIndex === 3) {
          return { rows: [{ id: 2, email: "b2@b.com", jwt: DataCrypto.encrypt("current-jwt") }] };
        }
        if (callIndex === 4) {
          return { rowCount: 1, rows: [] };
        }
        return { rows: [] };
      },
      async (calls) => {
        await expect(UserService.filterUsers({ jwt: "jwt-only" })).rejects.toThrow(
          /JWT filter requires at least one indexed filter/,
        );
        expect(calls.length).toBe(0);

        const users = await UserService.getUsers();
        expect(users.length).toBe(1);
        expect(users[0].jwt).toBe("jwt-1");

        const added = await UserService.addUser({ email: "b@b.com", jwt: "jwt-2" });
        expect(added.jwt).toBe("jwt-2");
        expect(DataCrypto.isEncrypted(calls[1].params[1])).toBe(true);

        const edited = await UserService.editUser(2, { email: "b2@b.com", jwt: "" });
        expect(edited.email).toBe("b2@b.com");
        expect(edited.jwt).toBe("current-jwt");

        const deleted = await UserService.deleteUser(2);
        expect(deleted).toBe(true);
        expect(calls[4].params).toEqual([2]);
      },
    );
  });

  test("filters users by decrypted jwt when indexed filter is provided", async () => {
    await withMockedQuery(
      async () => ({
        rows: [
          { id: 1, email: "a@a.com", jwt: DataCrypto.encrypt("jwt-1") },
          { id: 2, email: "a@a.com", jwt: DataCrypto.encrypt("jwt-2") },
        ],
      }),
      async () => {
        const users = await UserService.filterUsers({ email: "a@a.com", jwt: "jwt-2" });
        expect(users).toHaveLength(1);
        expect(users[0].id).toBe(2);
      },
    );
  });

  test("returns undefined when editing non-existing user", async () => {
    await withMockedQuery(
      async () => ({ rows: [] }),
      async () => {
        const edited = await UserService.editUser(999, { email: "x@x.com", jwt: "jwt-x" });
        expect(edited).toBeUndefined();
      },
    );
  });

  test("updates jwt when non-empty jwt is provided", async () => {
    await withMockedQuery(
      async (_text, _params, callIndex) => {
        if (callIndex === 0) {
          return { rows: [{ jwt: DataCrypto.encrypt("old-jwt") }] };
        }
        return { rows: [{ id: 2, email: "b@b.com", jwt: DataCrypto.encrypt("new-jwt") }] };
      },
      async (calls) => {
        const edited = await UserService.editUser(2, { email: "b@b.com", jwt: "new-jwt" });
        expect(edited.jwt).toBe("new-jwt");
        expect(DataCrypto.isEncrypted(calls[1].params[1])).toBe(true);
      },
    );
  });

  test("migrates only plain-text jwt rows", async () => {
    await withMockedQuery(
      async (_text, _params, callIndex) => {
        if (callIndex === 0) {
          return {
            rows: [
              { id: 1, jwt: "plain-jwt" },
              { id: 2, jwt: DataCrypto.encrypt("already-encrypted") },
              { id: 3, jwt: "" },
            ],
          };
        }
        return { rows: [] };
      },
      async (calls) => {
        const updatedRows = await UserService.migrateSensitiveData();
        expect(updatedRows).toBe(1);
        expect(calls.length).toBe(2);
        expect(calls[1].text).toMatch(/UPDATE/);
      },
    );
  });

  test("reencrypts only jwt rows requiring rotation", async () => {
    const needsSpy = jest.spyOn(DataCrypto, "needsReencryption");
    const reencryptSpy = jest.spyOn(DataCrypto, "reencryptToActive");
    needsSpy.mockImplementation((value) => value === "rotate-me");
    reencryptSpy.mockImplementation((value) => `rotated:${value}`);

    await withMockedQuery(
      async (_text, _params, callIndex) => {
        if (callIndex === 0) {
          return {
            rows: [
              { id: 1, jwt: "rotate-me" },
              { id: 2, jwt: "keep-me" },
            ],
          };
        }
        return { rows: [] };
      },
      async (calls) => {
        const updatedRows = await UserService.migrateSensitiveData({ reencrypt: true });
        expect(updatedRows).toBe(1);
        expect(reencryptSpy).toHaveBeenCalledWith("rotate-me");
        expect(calls.length).toBe(2);
      },
    );
  });
});
