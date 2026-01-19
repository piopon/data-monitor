import { NotifierCatalog } from "../notifiers/core/NotifierCatalog.js";
import { ModelUtils } from "../lib/ModelUtils.js";

export class Notifier {
  static #DB_TABLE_NAME = "notifiers";

  /**
   * Creates a new notifier from input JS object
   * @param {Object} object Input object from which to create notifier
   */
  constructor(object) {
    const input = ModelUtils.getValueOrDefault(object, {});
    this.id = ModelUtils.getValueOrDefault(input.id, undefined);
    this.type = ModelUtils.getValueOrDefault(input.type, "");
    this.origin = ModelUtils.getValueOrDefault(input.origin, "");
    this.sender = ModelUtils.getValueOrDefault(input.sender, "");
    this.password = ModelUtils.getValueOrDefault(input.password, "");
  }

  /**
   * Method used to retrieve SQL DB schema for notifier object
   * @returns string containing SQL schema describing notifier object
   */
  static getDatabaseSchema() {
    return `id SERIAL PRIMARY KEY,
            type TEXT NOT NULL CHECK ${Notifier.#getTypeSchema()},
            origin TEXT NOT NULL,
            sender TEXT NOT NULL,
            password TEXT`;
  }

  /**
   * Method used to retrieve notifier DB table name
   * @returns string with table name in DB
   */
  static getTableName() {
    return Notifier.#DB_TABLE_NAME;
  }

  /**
   * Method used to retrieve monitor conditions in a schema suitable format
   * @returns string with schema for condition field
   */
  static #getTypeSchema() {
    const supportedNotifierTypes = NotifierCatalog.getSupportedNotifiers().keys();
    return "(type IN (" + supportedNotifierTypes.map((notifier) => `'${notifier}'`).join(", ") + "))";
  }
}
