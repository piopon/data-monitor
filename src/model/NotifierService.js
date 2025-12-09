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
}
