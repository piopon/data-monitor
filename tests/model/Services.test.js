import test from "node:test";
import assert from "node:assert/strict";
import { Pool } from "pg";

import { DataCrypto } from "../../src/lib/DataCrypto.js";
import { MonitorService } from "../../src/model/MonitorService.js";
import { NotifierService } from "../../src/model/NotifierService.js";
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

test("MonitorService methods build expected SQL interactions", async () => {
  await withMockedQuery(
    async (_text, _params, callIndex) => {
      if (callIndex === 0) {
        return { rows: [] };
      }
      if (callIndex === 1) {
        return { rows: [{ id: 1 }] };
      }
      if (callIndex === 2) {
        return { rows: [{ id: 9, parent: "cpu", enabled: true }] };
      }
      if (callIndex === 3) {
        return { rows: [{ id: 9, parent: "cpu", enabled: false }] };
      }
      return { rowCount: 1, rows: [] };
    },
    async (calls) => {
      const initResult = await MonitorService.initializeTable();
      assert.equal(initResult.result, true);
      assert.match(initResult.message, /Initialized 'monitors' table/);
      assert.match(calls[0].text, /CREATE TABLE IF NOT EXISTS monitors/);

      const filtered = await MonitorService.filterMonitors({
        id: 1,
        parent: "cpu",
        enabled: true,
        interval: 10,
        threshold: 80,
        condition: ">",
        notifier: 2,
        user: 7,
      });
      assert.deepEqual(filtered, [{ id: 1 }]);
      assert.match(calls[1].text, /WHERE id = \$1 AND parent = \$2 AND enabled = \$3 AND interval = \$4 AND threshold = \$5 AND condition = \$6 AND notifier_id = \$7 AND user_id = \$8/);
      assert.deepEqual(calls[1].params, [1, "cpu", true, 10, 80, ">", 2, 7]);

      const added = await MonitorService.addMonitor({
        parent: "cpu",
        enabled: true,
        threshold: 90,
        condition: ">",
        notifier: 2,
        interval: 15,
        user: 7,
      });
      assert.equal(added.id, 9);
      assert.deepEqual(calls[2].params, ["cpu", true, 90, ">", 2, 15, 7]);

      const edited = await MonitorService.editMonitorForUser(9, 7, {
        parent: "cpu",
        enabled: false,
        threshold: 75,
        condition: "<",
        notifier: 2,
        interval: 20,
      });
      assert.equal(edited.enabled, false);
      assert.deepEqual(calls[3].params, ["cpu", false, 75, "<", 2, 20, 9, 7]);

      const deletedCount = await MonitorService.deleteMonitorForUser(9, 7);
      assert.equal(deletedCount, 1);
      assert.deepEqual(calls[4].params, [9, 7]);
    },
  );
});

test("NotifierService guards sensitive filters and maps encrypted values", async () => {
  await withMockedQuery(
    async (_text, _params, callIndex) => {
      if (callIndex === 0) {
        return { rows: [{ id: 1, type: "email", sender: "a@a.com", user_id: 3, origin: DataCrypto.encrypt("smtp"), password: DataCrypto.encrypt("pw") }] };
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
      await assert.rejects(
        async () => UserService.filterUsers({ jwt: "jwt-only" }),
        /JWT filter requires at least one indexed filter/,
      );
      assert.equal(calls.length, 0);

      const users = await UserService.getUsers();
      assert.equal(users.length, 1);
      assert.equal(users[0].jwt, "jwt-1");

      const added = await UserService.addUser({ email: "b@b.com", jwt: "jwt-2" });
      assert.equal(added.jwt, "jwt-2");
      assert.equal(DataCrypto.isEncrypted(calls[1].params[1]), true);

      const edited = await UserService.editUser(2, { email: "b2@b.com", jwt: "" });
      assert.equal(edited.email, "b2@b.com");
      assert.equal(edited.jwt, "current-jwt");

      const deleted = await UserService.deleteUser(2);
      assert.equal(deleted, true);
      assert.deepEqual(calls[4].params, [2]);
    },
  );
});
