import { DatabaseQuery } from "../lib/DatabaseQuery.js";
import { User } from "./User.js";

export class UserService {
  static #DB_TABLE_NAME = User.getTableName();

  static async initializeTable() {
    try {
      await DatabaseQuery(`
      CREATE TABLE IF NOT EXISTS ${UserService.#DB_TABLE_NAME} (
        ${User.getDatabaseSchema()}
      );`);
      return { result: true, message: `Initialized '${UserService.#DB_TABLE_NAME}' table.` };
    } catch (error) {
      return { result: false, message: `Cannot initialize '${UserService.#DB_TABLE_NAME}' table: ${error.message}.` };
    }
  }

  static async getUsers() {
    const { rows } = await DatabaseQuery(`SELECT * FROM ${UserService.#DB_TABLE_NAME}`);
    return rows;
  }

  static async filterUsers(filters) {
    const values = [];
    const conditions = [];

    if (filters.id) {
      values.push(filters.id);
      conditions.push(`id = $${values.length}`);
    }
    if (filters.email) {
      values.push(filters.email);
      conditions.push(`email = $${values.length}`);
    }
    if (filters.jwt) {
      values.push(filters.jwt);
      conditions.push(`jwt = $${values.length}`);
    }
    const whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";
    const { rows } = await DatabaseQuery(`SELECT * FROM ${UserService.#DB_TABLE_NAME} ${whereClause}`, values);
    return rows;
  }

  static async addUser(data) {
    const { email, jwt } = data;
    const { rows } = await DatabaseQuery(
      `INSERT INTO ${UserService.#DB_TABLE_NAME} (email, jwt) VALUES ($1, $2) RETURNING *`,
      [email, jwt]
    );
    return rows[0];
  }

  static async editUser(id, data) {
    const { email, jwt } = data;
    const { rows } = await DatabaseQuery(
      `UPDATE ${UserService.#DB_TABLE_NAME} SET email = $1, jwt = $2 WHERE id = $3 RETURNING *`,
      [email, jwt, id]
    );
    return rows[0];
  }
}
