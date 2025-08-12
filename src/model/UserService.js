import { DatabaseQuery } from "../lib/DatabaseQuery.js";
import { User } from "./User.js";

export class UserService {
  static #DB_TABLE_NAME = User.getTableName();

  static async initializeTable() {
    try {
      await DatabaseQuery(`
      CREATE TABLE IF NOT EXISTS ${UserService.#DB_TABLE_NAME} (
        ${Monitor.getDatabaseSchema()}
      );`);
      return { result: true, message: `Initialized '${UserService.#DB_TABLE_NAME}' table.` };
    } catch (error) {
      return { result: false, message: `Cannot initialize '${UserService.#DB_TABLE_NAME}' table: ${error.message}` };
    }
  }
}
