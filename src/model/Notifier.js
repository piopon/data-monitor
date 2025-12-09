import { ModelUtils } from "../lib/ModelUtils.js";

export class Notifier {
  static #DB_TABLE_NAME = "notifiers";

  constructor(object) {
    const input = ModelUtils.getValueOrDefault(object, {});
    this.type = ModelUtils.getValueOrDefault(input.type, "");
    this.origin = ModelUtils.getValueOrDefault(input.origin, "");
    this.sender = ModelUtils.getValueOrDefault(input.sender, "");
    this.password = ModelUtils.getValueOrDefault(input.password, "");
  }

  static getDatabaseSchema() {
    return `id SERIAL PRIMARY KEY,
            type TEXT NOT NULL CHECK (type IN ('email', 'discord')),
            origin TEXT NOT NULL,
            sender TEXT NOT NULL,
            password TEXT`;
  }

  static getTableName() {
    return Notifier.#DB_TABLE_NAME;
  }
}
