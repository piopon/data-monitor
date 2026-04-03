import test from "node:test";
import assert from "node:assert/strict";

import { User } from "../../src/model/User.js";

test("User constructor applies defaults", () => {
  const user = new User();

  assert.equal(user.id, undefined);
  assert.equal(user.email, "");
  assert.equal(user.jwt, "");
});

test("User constructor maps provided values", () => {
  const user = new User({ id: 42, email: "user@example.com", jwt: "jwt-token" });

  assert.equal(user.id, 42);
  assert.equal(user.email, "user@example.com");
  assert.equal(user.jwt, "jwt-token");
});

test("User static schema and table name are stable", () => {
  const schema = User.getDatabaseSchema();

  assert.equal(User.getTableName(), "users");
  assert.match(schema, /id SERIAL PRIMARY KEY/);
  assert.match(schema, /email TEXT NOT NULL UNIQUE/);
  assert.match(schema, /jwt TEXT NOT NULL UNIQUE/);
});
