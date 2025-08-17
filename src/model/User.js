import { ModelUtils } from "../lib/ModelUtils.js";

export class User {
  static #DB_TABLE_NAME = "users";

  /**
   * Creates a new user from input JS object
   * @param {Object} object Input object from which to create user
   */
  constructor(object) {
    const input = ModelUtils.getValueOrDefault(object, {});
    this.email = ModelUtils.getValueOrDefault(input.email, "");
    this.jwt = ModelUtils.getValueOrDefault(input.jwt, "");
  }

  /**
   * Method used to retrieve SQL DB schema for user object
   * @returns string containing SQL schema describing user object
   */
  static getDatabaseSchema() {
    return `id SERIAL PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            jwt TEXT NOT NULL UNIQUE`;
  }

  /**
   * Method used to retrieve user DB table name
   * @returns string with table name in DB
   */
  static getTableName() {
    return User.#DB_TABLE_NAME;
  }
}
