import { Notifier } from "../../src/model/Notifier.js";
import { NotifierCatalog } from "../../src/notifiers/core/NotifierCatalog.js";

test("Notifier constructor applies defaults", () => {
  const notifier = new Notifier();

  expect(notifier.id).toBeUndefined();
  expect(notifier.type).toBe("");
  expect(notifier.origin).toBe("");
  expect(notifier.sender).toBe("");
  expect(notifier.password).toBe("");
  expect(notifier.userId).toBeUndefined();
});

test("Notifier constructor maps provided values", () => {
  const notifier = new Notifier({
    id: 5,
    type: "email",
    origin: "smtp.example.com",
    sender: "noreply@example.com",
    password: "secret",
    userId: 11,
  });

  expect(notifier.id).toBe(5);
  expect(notifier.type).toBe("email");
  expect(notifier.origin).toBe("smtp.example.com");
  expect(notifier.sender).toBe("noreply@example.com");
  expect(notifier.password).toBe("secret");
  expect(notifier.userId).toBe(11);
});

test("Notifier table name and schema match supported notifiers", () => {
  const schema = Notifier.getDatabaseSchema();

  expect(Notifier.getTableName()).toBe("notifiers");
  expect(schema).toMatch(/id SERIAL PRIMARY KEY/);
  expect(schema).toMatch(/user_id INTEGER NOT NULL REFERENCES users\(id\)/);
  expect(schema).toMatch(/UNIQUE \(user_id, type\)/);

  for (const notifierType of NotifierCatalog.getSupportedNotifiers().keys()) {
    expect(schema.includes(`'${notifierType}'`)).toBe(true);
  }
});
