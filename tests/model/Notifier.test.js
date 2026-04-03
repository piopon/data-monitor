import test from "node:test";
import assert from "node:assert/strict";

import { Notifier } from "../../src/model/Notifier.js";
import { NotifierCatalog } from "../../src/notifiers/core/NotifierCatalog.js";

test("Notifier constructor applies defaults", () => {
  const notifier = new Notifier();

  assert.equal(notifier.id, undefined);
  assert.equal(notifier.type, "");
  assert.equal(notifier.origin, "");
  assert.equal(notifier.sender, "");
  assert.equal(notifier.password, "");
  assert.equal(notifier.userId, undefined);
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

  assert.equal(notifier.id, 5);
  assert.equal(notifier.type, "email");
  assert.equal(notifier.origin, "smtp.example.com");
  assert.equal(notifier.sender, "noreply@example.com");
  assert.equal(notifier.password, "secret");
  assert.equal(notifier.userId, 11);
});

test("Notifier table name and schema match supported notifiers", () => {
  const schema = Notifier.getDatabaseSchema();

  assert.equal(Notifier.getTableName(), "notifiers");
  assert.match(schema, /id SERIAL PRIMARY KEY/);
  assert.match(schema, /user_id INTEGER NOT NULL REFERENCES users\(id\)/);
  assert.match(schema, /UNIQUE \(user_id, type\)/);

  for (const notifierType of NotifierCatalog.getSupportedNotifiers().keys()) {
    assert.ok(schema.includes(`'${notifierType}'`));
  }
});
