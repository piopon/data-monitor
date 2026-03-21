import { DatabaseQuery } from "../lib/DatabaseQuery.js";
import { SensitiveDataCodec } from "../lib/SensitiveDataCodec.js";
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
    return rows.map((row) => UserService.#toPublicUser(row));
  }

  /**
   * Method used to receive users matching provided filter expression
   * @param {String} query expression used to filter user objects
   * @returns array of user objects matching filter expression
   */
  static async filterUsers(filters) {
    const values = [];
    const conditions = [];
    let jwtFilter = undefined;

    if (filters.id) {
      values.push(filters.id);
      conditions.push(`id = $${values.length}`);
    }
    if (filters.email) {
      values.push(filters.email);
      conditions.push(`email = $${values.length}`);
    }
    if (filters.jwt) {
      jwtFilter = filters.jwt;
    }
    const whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";
    const { rows } = await DatabaseQuery(`SELECT * FROM ${UserService.#DB_TABLE_NAME} ${whereClause}`, values);
    const users = rows.map((row) => UserService.#toPublicUser(row));
    if (jwtFilter == null) {
      return users;
    }
    return users.filter((user) => user.jwt === jwtFilter);
  }

  /**
   * Method used to add provided user data to database
   * @param {Object} data user object which we want to add to database
   * @returns added user object
   */
  static async addUser(data) {
    const { email, jwt } = data;
    const encryptedJwt = SensitiveDataCodec.encrypt(jwt);
    const { rows } = await DatabaseQuery(
      `INSERT INTO ${UserService.#DB_TABLE_NAME} (email, jwt) VALUES ($1, $2) RETURNING *`,
      [email, encryptedJwt]
    );
    return UserService.#toPublicUser(rows[0]);
  }

  /**
   * Method used to edit user data in the database
   * @param {Number} id database identifier which we want to edit
   * @param {Object} data user object which we want to add to database
   * @returns updated user object
   */
  static async editUser(id, data) {
    const { email, jwt } = data;
    const encryptedJwt = SensitiveDataCodec.encrypt(jwt);
    const { rows } = await DatabaseQuery(
      `UPDATE ${UserService.#DB_TABLE_NAME} SET email = $1, jwt = $2 WHERE id = $3 RETURNING *`,
      [email, encryptedJwt, id]
    );
    return UserService.#toPublicUser(rows[0]);
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

  /**
   * Method used to migrate plain-text sensitive values to encrypted payload format
   * @returns number of updated rows
   */
  static async migrateSensitiveData() {
    const { rows } = await DatabaseQuery(`SELECT id, jwt FROM ${UserService.#DB_TABLE_NAME}`);
    let updatedRows = 0;
    for (const row of rows) {
      if (row?.jwt == null || row.jwt === "" || SensitiveDataCodec.isEncrypted(row.jwt)) {
        continue;
      }
      const encryptedJwt = SensitiveDataCodec.encrypt(row.jwt);
      await DatabaseQuery(`UPDATE ${UserService.#DB_TABLE_NAME} SET jwt = $1 WHERE id = $2`, [encryptedJwt, row.id]);
      updatedRows += 1;
    }
    return updatedRows;
  }

  /**
   * Method used to convert database user row into response-safe model shape
   * @param {Object} row Raw database row
   * @returns user object with decoded sensitive fields
   */
  static #toPublicUser(row) {
    if (row == null) {
      return row;
    }
    return {
      ...row,
      jwt: SensitiveDataCodec.decrypt(row.jwt),
    };
  }
}
