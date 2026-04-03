import test from "node:test";
import assert from "node:assert/strict";
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

test("NotifierService guards sensitive filters and maps encrypted values", async () => {
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
        return { rowCount: 1, rows: [] };
      }
      return { rows: [] };
    },
    async (calls) => {
      await assert.rejects(
        async () => NotifierService.filterNotifiers({ origin: "x" }),
        /Origin\/password filter requires at least one non-sensitive filter/,
      );
      assert.equal(calls.length, 0);

      const filtered = await NotifierService.filterNotifiers({ id: 1, origin: "smtp", password: "pw" });
      assert.equal(filtered.length, 1);
      assert.equal(filtered[0].origin, "smtp");
      assert.equal(filtered[0].password, "pw");
      assert.match(calls[0].text, /WHERE id = \$1/);

      const added = await NotifierService.addNotifier({
        type: "discord",
        origin: "https://discord.com/api/webhooks/x",
        sender: "bot",
        password: "token-1",
        user: 3,
      });
      assert.equal(added.origin, "https://discord.com/api/webhooks/x");
      assert.equal(added.password, "token-1");
      assert.equal(DataCrypto.isEncrypted(calls[1].params[1]), true);
      assert.equal(DataCrypto.isEncrypted(calls[1].params[3]), true);

      const edited = await NotifierService.editNotifierForUser(2, 3, {
        type: "discord",
        origin: "",
        sender: "new-bot",
        password: "",
      });
      assert.equal(edited.sender, "new-bot");
      assert.equal(edited.origin, "existing-origin");
      assert.equal(edited.password, "existing-pass");

      const deleted = await NotifierService.deleteNotifierForUser(2, 3);
      assert.equal(deleted, 1);
      assert.deepEqual(calls[4].params, [2, 3]);
    },
  );
});
