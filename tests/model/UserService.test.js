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

test("UserService handles encrypted jwt and guardrails", async () => {
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
