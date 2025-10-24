import { ModelUtils } from "../lib/ModelUtils.js";
import { User } from "./User.js";

export class Monitor {
  static #DB_TABLE_NAME = "monitors";
  static CONDITIONS = [
    { value: "<", text: "<" },
    { value: "≤", text: "≤" },
    { value: ">", text: ">" },
    { value: "≥", text: "≥" },
  ];
  static NOTIFIERS = [
    { value: "email", text: "email", api: "api/notifier?type=email" },
    { value: "discord", text: "discord" },
  ];

  /**
   * Creates a new monitor from input JS object
   * @param {Object} object Input object from which to create monitor
   */
  constructor(object) {
    const input = ModelUtils.getValueOrDefault(object, {});
    this.parent = ModelUtils.getValueOrDefault(input.parent, "");
    this.enabled = ModelUtils.getValueOrDefault(input.enabled, false);
    this.threshold = ModelUtils.getValueOrDefault(input.threshold, undefined);
    this.condition = ModelUtils.getValueOrDefault(input.condition, undefined);
    this.notifier = ModelUtils.getValueOrDefault(input.notifier, undefined);
  }

  /**
   * Method used to retrieve SQL DB schema for monitor object
   * @returns string containing SQL schema describing monitor object
   */
  static getDatabaseSchema() {
    return `id SERIAL PRIMARY KEY,
            parent TEXT NOT NULL UNIQUE,
            enabled BOOLEAN DEFAULT false,
            threshold NUMERIC NOT NULL,
            condition TEXT NOT NULL CHECK ${Monitor.#getConditionSchema()},
            notifier TEXT NOT NULL,
            user_id SERIAL REFERENCES ${User.getTableName()}(id)`;
  }

  /**
   * Method used to retrieve monitor DB table name
   * @returns string with table name in DB
   */
  static getTableName() {
    return Monitor.#DB_TABLE_NAME;
  }

  /**
   * Method used to retrieve monitor conditions in a schema suitable format
   * @returns string with schema for condition field
   */
  static #getConditionSchema() {
    return "(condition IN (" + Monitor.CONDITIONS.map((condition) => `'${condition.text}'`).join(", ") + "))";
  }
}
