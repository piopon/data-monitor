import { ModelUtils } from "../lib/ModelUtils.js";

export class User {
  static #DB_TABLE_NAME = "user";

  constructor(object) {
    const input = ModelUtils.getValueOrDefault(object, {});
    this.jwt = ModelUtils.getValueOrDefault(input.jwt, "");
  }

  static getDatabaseSchema() {
    return `id SERIAL PRIMARY KEY,
            jwt TEXT NOT NULL UNIQUE`;
  }

  static getTableName() {
    return User.#DB_TABLE_NAME;
  }
}
