import { DatabaseQuery } from "../lib/DatabaseQuery.js";
import { User } from "./User.js";

export class UserService {
  static #DB_TABLE_NAME = User.getTableName();

  /**
   * Method used to initialize database table for user data
   * @returns object with initialize result and detailed info message
   */
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

  /**
   * Method used to receive all user saved in database
   * @returns array of user objects from database
   */
  static async getUsers() {
    const { rows } = await DatabaseQuery(`SELECT * FROM ${UserService.#DB_TABLE_NAME}`);
    return rows;
  }

  /**
   * Method used to receive users matching provided filter expression
   * @param {String} query expression used to filter user objects
   * @returns array of user objects matching filter expression
   */
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

  /**
   * Method used to add provided user data to database
   * @param {Object} data user object which we want to add to database
   * @returns added user object
   */
  static async addUser(data) {
    const { email, jwt } = data;
    const { rows } = await DatabaseQuery(
      `INSERT INTO ${UserService.#DB_TABLE_NAME} (email, jwt) VALUES ($1, $2) RETURNING *`,
      [email, jwt]
    );
    return rows[0];
  }

  /**
   * Method used to edit user data in the database
   * @param {Number} id database identifier which we want to edit
   * @param {Object} data user object which we want to add to database
   * @returns updated user object
   */
  static async editUser(id, data) {
    const { email, jwt } = data;
    const { rows } = await DatabaseQuery(
      `UPDATE ${UserService.#DB_TABLE_NAME} SET email = $1, jwt = $2 WHERE id = $3 RETURNING *`,
      [email, jwt, id]
    );
    return rows[0];
  }

  /**
   * Method used to delete user data from the database
   * @param {Number} id database identifier which we want to remove
   * @returns number of deleted user object(s)
   */
  static async deleteUser(id) {
    const { rowCount } = await DatabaseQuery(`DELETE FROM ${UserService.#DB_TABLE_NAME} WHERE id = $1`, [id]);
    return rowCount > 0;
  }
}
