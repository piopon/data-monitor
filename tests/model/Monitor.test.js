import test from "node:test";
import assert from "node:assert/strict";

import { Monitor } from "../../src/model/Monitor.js";

test("Monitor constructor applies defaults", () => {
  const monitor = new Monitor();

  assert.equal(monitor.id, undefined);
  assert.equal(monitor.parent, "");
  assert.equal(monitor.enabled, false);
  assert.equal(monitor.interval, undefined);
  assert.equal(monitor.threshold, undefined);
  assert.equal(monitor.condition, undefined);
  assert.equal(monitor.notifierId, undefined);
  assert.equal(monitor.userId, undefined);
});

test("Monitor constructor maps provided values", () => {
  const monitor = new Monitor({
    id: 10,
    parent: "cpu.load",
    enabled: true,
    interval: 30,
    threshold: 80,
    condition: ">",
    notifierId: 3,
    userId: 99,
  });

  assert.equal(monitor.id, 10);
  assert.equal(monitor.parent, "cpu.load");
  assert.equal(monitor.enabled, true);
  assert.equal(monitor.interval, 30);
  assert.equal(monitor.threshold, 80);
  assert.equal(monitor.condition, ">");
  assert.equal(monitor.notifierId, 3);
  assert.equal(monitor.userId, 99);
});

test("Monitor exposes expected constants and table name", () => {
  assert.deepEqual(Monitor.CONDITIONS, [
    { value: "<", text: "<" },
    { value: "≤", text: "≤" },
    { value: ">", text: ">" },
    { value: "≥", text: "≥" },
  ]);
  assert.equal(Monitor.getTableName(), "monitors");
});

test("Monitor.getDatabaseSchema contains key constraints", () => {
  const schema = Monitor.getDatabaseSchema();

  assert.match(schema, /id SERIAL PRIMARY KEY/);
  assert.match(schema, /parent TEXT NOT NULL/);
  assert.match(schema, /notifier_id INTEGER REFERENCES notifiers\(id\)/);
  assert.match(schema, /user_id INTEGER NOT NULL REFERENCES users\(id\)/);
  assert.match(schema, /UNIQUE \(user_id, parent\)/);
  assert.match(schema, /condition IN \('<', '≤', '>', '≥'\)/);
});
