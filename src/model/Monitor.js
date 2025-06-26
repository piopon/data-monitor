import { ModelUtils } from "@/lib/ModelUtils";

export class Monitor {
  static #DB_TABLE_NAME = "monitor";
  static CONDITIONS = [
    { value: "<", text: "<" },
    { value: "≤", text: "≤" },
    { value: ">", text: ">" },
    { value: "≥", text: "≥" },
  ];
  static NOTIFIERS = [
    { value: "email", text: "email" },
    { value: "discord", text: "discord" },
  ];

  constructor(object) {
    const input = ModelUtils.getValueOrDefault(object, {});
    this.parent = ModelUtils.getValueOrDefault(input.parent, "");
    this.enabled = ModelUtils.getValueOrDefault(input.enabled, false);
    this.threshold = ModelUtils.getValueOrDefault(input.threshold, undefined);
    this.condition = ModelUtils.getValueOrDefault(input.condition, undefined);
    this.notifier = ModelUtils.getValueOrDefault(input.notifier, undefined);
  }

  static getDatabaseSchema() {
    return `id SERIAL PRIMARY KEY,
            parent TEXT NOT NULL UNIQUE,
            enabled BOOLEAN DEFAULT false,
            threshold NUMERIC NOT NULL,
            condition TEXT NOT NULL CHECK (condition IN ('<', '≤', '>', '≥')),
            notifier TEXT NOT NULL`;
  }

  static getTableName() {
    return Monitor.#DB_TABLE_NAME;
  }
}
