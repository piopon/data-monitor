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

  static async getUsers() {
    const { rows } = await DatabaseQuery(`SELECT * FROM ${UserService.#DB_TABLE_NAME}`);
    return rows;
  }

  static async getUser(id) {
    const { rows } = await DatabaseQuery(`SELECT * FROM ${UserService.#DB_TABLE_NAME} WHERE id = $1`, [id]);
    return rows;
  }

  static async addUser(data) {
    const { jwt } = data;
    const { rows } = await DatabaseQuery(`INSERT INTO ${UserService.#DB_TABLE_NAME} (jwt) VALUES ($1) RETURNING *`, [
      jwt,
    ]);
    return rows[0];
  }

  static async editUser(id, data) {
    const { jwt } = data;
    const { rows } = await DatabaseQuery(
      `UPDATE ${UserService.#DB_TABLE_NAME} SET jwt = $1 WHERE id = $2 RETURNING *`,
      [jwt, id]
    );
    return rows[0];
  }
}
