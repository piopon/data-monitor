import { ModelUtils } from "../lib/ModelUtils.js";

export class User {
  static #DB_TABLE_NAME = "user";

  constructor(object) {
    const input = ModelUtils.getValueOrDefault(object, {});
    this.email = ModelUtils.getValueOrDefault(input.email, "");
    this.jwt = ModelUtils.getValueOrDefault(input.jwt, "");
  }

  static getDatabaseSchema() {
    return `id SERIAL PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            jwt TEXT NOT NULL UNIQUE`;
  }

  static getTableName() {
    return User.#DB_TABLE_NAME;
  }
}
