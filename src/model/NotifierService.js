import { DatabaseQuery } from "../lib/DatabaseQuery.js";
import { Notifier } from "./Notifier.js";

export class NotifierService {
  static #DB_TABLE_NAME = Notifier.getTableName();

  static async initializeTable() {
    try {
      await DatabaseQuery(`
      CREATE TABLE IF NOT EXISTS ${NotifierService.#DB_TABLE_NAME} (
        ${Notifier.getDatabaseSchema()}
      );`);
      return { result: true, message: `Initialized '${NotifierService.#DB_TABLE_NAME}' table.` };
    } catch (error) {
      return { result: false, message: `Cannot initialize '${NotifierService.#DB_TABLE_NAME}' table: ${error.message}.` };
    }
  }

  static async getNotifiers() {
    const { rows } = await DatabaseQuery(`SELECT * FROM ${NotifierService.#DB_TABLE_NAME}`);
    return rows;
  }

  static async filterNotifiers(filters) {
    const values = [];
    const conditions = [];

    if (filters.type) {
      values.push(filters.type);
      conditions.push(`type = $${values.length}`);
    }
    if (filters.origin) {
      values.push(filters.origin);
      conditions.push(`origin = $${values.length}`);
    }
    if (filters.sender) {
      values.push(filters.sender);
      conditions.push(`sender = $${values.length}`);
    }
    if (filters.password) {
      values.push(filters.password);
      conditions.push(`password = $${values.length}`);
    }
    const whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";
    const { rows } = await DatabaseQuery(`SELECT * FROM ${NotifierService.#DB_TABLE_NAME} ${whereClause}`, values);
    return rows;
  }
}
