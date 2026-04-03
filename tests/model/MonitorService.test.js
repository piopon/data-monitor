import test from "node:test";
import assert from "node:assert/strict";
import { Pool } from "pg";

import { MonitorService } from "../../src/model/MonitorService.js";

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
