import { Pool } from "pg";

import { DataCrypto } from "../../src/lib/DataCrypto.js";
import { NotifierService } from "../../src/model/NotifierService.js";

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

describe("NotifierService", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("initializeTable returns success and failure results", async () => {
    await withMockedQuery(
      async () => ({ rows: [] }),
      async () => {
        const result = await NotifierService.initializeTable();
        expect(result.result).toBe(true);
      },
    );

    await withMockedQuery(
      async () => {
        throw new Error("db error");
      },
      async () => {
        const result = await NotifierService.initializeTable();
        expect(result.result).toBe(false);
        expect(result.message).toContain("db error");
      },
    );
  });

  test("guards sensitive filters and maps encrypted values", async () => {
    await withMockedQuery(
      async (_text, _params, callIndex) => {
        if (callIndex === 0) {
          return {
            rows: [
              {
                id: 1,
                type: "email",
                sender: "a@a.com",
                user_id: 3,
                origin: DataCrypto.encrypt("smtp"),
                password: DataCrypto.encrypt("pw"),
              },
            ],
          };
        }
        if (callIndex === 1) {
          return {
            rows: [
              {
                id: 2,
                type: "discord",
                sender: "bot",
                user_id: 3,
                origin: DataCrypto.encrypt("https://discord.com/api/webhooks/x"),
                password: DataCrypto.encrypt("token-1"),
              },
            ],
          };
        }
        if (callIndex === 2) {
          return { rows: [{ origin: DataCrypto.encrypt("existing-origin"), password: DataCrypto.encrypt("existing-pass") }] };
        }
        if (callIndex === 3) {
          return {
            rows: [
              {
                id: 2,
                type: "discord",
                sender: "new-bot",
                user_id: 3,
                origin: DataCrypto.encrypt("existing-origin"),
                password: DataCrypto.encrypt("existing-pass"),
              },
            ],
          };
        }
        if (callIndex === 4) {
          return { rows: [] };
        }
        if (callIndex === 5) {
          return { rowCount: 1, rows: [] };
        }
        if (callIndex === 6) {
          return { rowCount: 1, rows: [] };
        }
        return { rows: [] };
      },
      async (calls) => {
        await expect(NotifierService.filterNotifiers({ origin: "x" })).rejects.toThrow(
          /Origin\/password filter requires at least one non-sensitive filter/,
        );
        expect(calls.length).toBe(0);

        const filtered = await NotifierService.filterNotifiers({ id: 1, origin: "smtp", password: "pw" });
        expect(filtered.length).toBe(1);
        expect(filtered[0].origin).toBe("smtp");
        expect(filtered[0].password).toBe("pw");
        expect(calls[0].text).toMatch(/WHERE id = \$1/);

        const added = await NotifierService.addNotifier({
          type: "discord",
          origin: "https://discord.com/api/webhooks/x",
          sender: "bot",
          password: "token-1",
          user: 3,
        });
        expect(added.origin).toBe("https://discord.com/api/webhooks/x");
        expect(added.password).toBe("token-1");
        expect(DataCrypto.isEncrypted(calls[1].params[1])).toBe(true);
        expect(DataCrypto.isEncrypted(calls[1].params[3])).toBe(true);

        const edited = await NotifierService.editNotifierForUser(2, 3, {
          type: "discord",
          origin: "",
          sender: "new-bot",
          password: "",
        });
        expect(edited.sender).toBe("new-bot");
        expect(edited.origin).toBe("existing-origin");
        expect(edited.password).toBe("existing-pass");

        const deleted = await NotifierService.deleteNotifierForUser(2, 3);
        expect(deleted).toBe(1);
        expect(calls[4].text).toBe("BEGIN");
        expect(calls[5].text).toMatch(/UPDATE monitors SET notifier_id = NULL/);
        expect(calls[5].params).toEqual([2, 3]);
        expect(calls[6].params).toEqual([2, 3]);
        expect(calls[7].text).toBe("COMMIT");
      },
    );
  });

  test("returns undefined when editing non-existing notifier", async () => {
    await withMockedQuery(
      async () => ({ rows: [] }),
      async () => {
        const edited = await NotifierService.editNotifierForUser(999, 3, {
          type: "email",
          origin: "smtp",
          sender: "x",
          password: "p",
        });
        expect(edited).toBeUndefined();
      },
    );
  });

  test("updates sensitive fields when non-empty values are provided", async () => {
    await withMockedQuery(
      async (_text, _params, callIndex) => {
        if (callIndex === 0) {
          return { rows: [{ origin: DataCrypto.encrypt("old-origin"), password: DataCrypto.encrypt("old-pass") }] };
        }
        return {
          rows: [
            {
              id: 2,
              type: "email",
              sender: "sender@test.com",
              user_id: 3,
              origin: DataCrypto.encrypt("smtp-new"),
              password: DataCrypto.encrypt("pass-new"),
            },
          ],
        };
      },
      async (calls) => {
        const edited = await NotifierService.editNotifierForUser(2, 3, {
          type: "email",
          origin: "smtp-new",
          sender: "sender@test.com",
          password: "pass-new",
        });
        expect(edited.origin).toBe("smtp-new");
        expect(edited.password).toBe("pass-new");
        expect(DataCrypto.isEncrypted(calls[1].params[1])).toBe(true);
        expect(DataCrypto.isEncrypted(calls[1].params[3])).toBe(true);
      },
    );
  });

  test("migrates only plain-text sensitive rows", async () => {
    await withMockedQuery(
      async (_text, _params, callIndex) => {
        if (callIndex === 0) {
          return {
            rows: [
              { id: 1, origin: "smtp", password: "pw" },
              { id: 2, origin: DataCrypto.encrypt("already"), password: DataCrypto.encrypt("encrypted") },
              { id: 3, origin: "", password: "" },
            ],
          };
        }
        return { rows: [] };
      },
      async (calls) => {
        const updatedRows = await NotifierService.migrateSensitiveData();
        expect(updatedRows).toBe(1);
        expect(calls.length).toBe(2);
        expect(calls[1].text).toMatch(/UPDATE/);
      },
    );
  });

  test("reencrypts only rows that require rotation", async () => {
    const needsSpy = jest.spyOn(DataCrypto, "needsReencryption");
    const reencryptSpy = jest.spyOn(DataCrypto, "reencryptToActive");
    needsSpy.mockImplementation((value) => value === "rotate-this");
    reencryptSpy.mockImplementation((value) => `rotated:${value}`);

    await withMockedQuery(
      async (_text, _params, callIndex) => {
        if (callIndex === 0) {
          return {
            rows: [
              { id: 1, origin: "rotate-this", password: "" },
              { id: 2, origin: "stable", password: "stable" },
            ],
          };
        }
        return { rows: [] };
      },
      async (calls) => {
        const updatedRows = await NotifierService.migrateSensitiveData({ reencrypt: true });
        expect(updatedRows).toBe(1);
        expect(reencryptSpy).toHaveBeenCalledWith("rotate-this");
        expect(calls.length).toBe(2);
      },
    );
  });
});
