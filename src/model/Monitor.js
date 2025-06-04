import { ModelUtils } from "@/lib/ModelUtils";

export class Monitor {
  static #DB_TABLE_NAME = "monitor";

  constructor(object) {
    const input = ModelUtils.getValueOrDefault(object, {});
    this.parent = ModelUtils.getValueOrDefault(input.parent, "");
    this.enable = ModelUtils.getValueOrDefault(input.enable, false);
    this.threshold = ModelUtils.getValueOrDefault(input.threshold, undefined);
    this.condition = ModelUtils.getValueOrDefault(input.condition, undefined);
    this.notifier = ModelUtils.getValueOrDefault(input.notifier, undefined);
  }

  static getDatabaseSchema() {
    return `id SERIAL PRIMARY KEY,
            parent TEXT NOT NULL,
            enable BOOLEAN DEFAULT false,
            threshold NUMERIC NOT NULL,
            condition TEXT NOT NULL CHECK (condition IN ('<', '<=', '>', '>=')),
            notifier TEXT NOT NULL`;
  }

  static getTableName() {
    return Monitor.#DB_TABLE_NAME;
  }
}
