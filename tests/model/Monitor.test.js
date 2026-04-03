import { Monitor } from "../../src/model/Monitor.js";

test("Monitor constructor applies defaults", () => {
  const monitor = new Monitor();

  expect(monitor.id).toBeUndefined();
  expect(monitor.parent).toBe("");
  expect(monitor.enabled).toBe(false);
  expect(monitor.interval).toBeUndefined();
  expect(monitor.threshold).toBeUndefined();
  expect(monitor.condition).toBeUndefined();
  expect(monitor.notifierId).toBeUndefined();
  expect(monitor.userId).toBeUndefined();
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

  expect(monitor.id).toBe(10);
  expect(monitor.parent).toBe("cpu.load");
  expect(monitor.enabled).toBe(true);
  expect(monitor.interval).toBe(30);
  expect(monitor.threshold).toBe(80);
  expect(monitor.condition).toBe(">");
  expect(monitor.notifierId).toBe(3);
  expect(monitor.userId).toBe(99);
});

test("Monitor exposes expected constants and table name", () => {
  expect(Monitor.CONDITIONS).toEqual([
    { value: "<", text: "<" },
    { value: "≤", text: "≤" },
    { value: ">", text: ">" },
    { value: "≥", text: "≥" },
  ]);
  expect(Monitor.getTableName()).toBe("monitors");
});

test("Monitor.getDatabaseSchema contains key constraints", () => {
  const schema = Monitor.getDatabaseSchema();

  expect(schema).toMatch(/id SERIAL PRIMARY KEY/);
  expect(schema).toMatch(/parent TEXT NOT NULL/);
  expect(schema).toMatch(/notifier_id INTEGER REFERENCES notifiers\(id\)/);
  expect(schema).toMatch(/user_id INTEGER NOT NULL REFERENCES users\(id\)/);
  expect(schema).toMatch(/UNIQUE \(user_id, parent\)/);
  expect(schema).toMatch(/condition IN \('<', '≤', '>', '≥'\)/);
});
