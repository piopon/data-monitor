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
      expect(initResult.result).toBe(true);
      expect(initResult.message).toMatch(/Initialized 'monitors' table/);
      expect(calls[0].text).toMatch(/CREATE TABLE IF NOT EXISTS monitors/);

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
      expect(filtered).toEqual([{ id: 1 }]);
      expect(calls[1].text).toMatch(/WHERE id = \$1 AND parent = \$2 AND enabled = \$3 AND interval = \$4 AND threshold = \$5 AND condition = \$6 AND notifier_id = \$7 AND user_id = \$8/);
      expect(calls[1].params).toEqual([1, "cpu", true, 10, 80, ">", 2, 7]);

      const added = await MonitorService.addMonitor({
        parent: "cpu",
        enabled: true,
        threshold: 90,
        condition: ">",
        notifier: 2,
        interval: 15,
        user: 7,
      });
      expect(added.id).toBe(9);
      expect(calls[2].params).toEqual(["cpu", true, 90, ">", 2, 15, 7]);

      const edited = await MonitorService.editMonitorForUser(9, 7, {
        parent: "cpu",
        enabled: false,
        threshold: 75,
        condition: "<",
        notifier: 2,
        interval: 20,
      });
      expect(edited.enabled).toBe(false);
      expect(calls[3].params).toEqual(["cpu", false, 75, "<", 2, 20, 9, 7]);

      const deletedCount = await MonitorService.deleteMonitorForUser(9, 7);
      expect(deletedCount).toBe(1);
      expect(calls[4].params).toEqual([9, 7]);
    },
  );
});
