import { User } from "../../src/model/User.js";

test("User constructor applies defaults", () => {
  const user = new User();

  expect(user.id).toBeUndefined();
  expect(user.email).toBe("");
  expect(user.jwt).toBe("");
});

test("User constructor maps provided values", () => {
  const user = new User({ id: 42, email: "user@example.com", jwt: "jwt-token" });

  expect(user.id).toBe(42);
  expect(user.email).toBe("user@example.com");
  expect(user.jwt).toBe("jwt-token");
});

test("User static schema and table name are stable", () => {
  const schema = User.getDatabaseSchema();

  expect(User.getTableName()).toBe("users");
  expect(schema).toMatch(/id SERIAL PRIMARY KEY/);
  expect(schema).toMatch(/email TEXT NOT NULL UNIQUE/);
  expect(schema).toMatch(/jwt TEXT NOT NULL UNIQUE/);
});
