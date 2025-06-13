import { DatabaseQuery } from "@/lib/DatabaseQuery";
import { Monitor } from "./Monitor";

export class MonitorService {
  static #DB_TABLE_NAME = Monitor.getTableName();

  /**
   * Method used to initialize database table for monitor data
   * @returns object with initialize result and detailed info message
   */
  static async initializeTable() {
    try {
      await DatabaseQuery(`
      CREATE TABLE IF NOT EXISTS ${MonitorService.#DB_TABLE_NAME} (
        ${Monitor.getDatabaseSchema()}
      );`);
      return { result: true, message: `Initialized '${MonitorService.#DB_TABLE_NAME}' table.` };
    } catch (error) {
      return { result: false, message: `Cannot initialize '${MonitorService.#DB_TABLE_NAME}' table: ${error.message}` };
    }
  }

  /**
   * Method used to receive all monitors saved in database
   * @returns array of monitor objects from database
   */
  static async getMonitors() {
    const { rows } = await DatabaseQuery(`SELECT * FROM ${MonitorService.#DB_TABLE_NAME}`);
    return rows;
  }

  /**
   * Method used to receive monitors matching provided filter expression
   * @param {String} filter expression used to filter monitor objects
   * @returns array of monitor objects matching filter expression
   */
  static async filterMonitors(query) {
    const { rows } = await DatabaseQuery(
      `SELECT * FROM ${
        MonitorService.#DB_TABLE_NAME
      } WHERE parent ILIKE $1 OR enable ILIKE $1 OR threshold ILIKE $1 OR condition ILIKE $1 OR notifier ILIKE $1`,
      [`%${query}%`]
    );
    return rows;
  }

  /**
   * Method used to add provided monitor data to database
   * @param {Object} data monitor object which we want to add to database
   * @returns added monitor object
   */
  static async addMonitor(data) {
    const { parent, enable, threshold, condition, notifier } = data;
    const { rows } = await DatabaseQuery(
      `INSERT INTO ${
        MonitorService.#DB_TABLE_NAME
      } (parent, enable, threshold, condition, notifier) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [parent, enable, threshold, condition, notifier]
    );
    return rows[0];
  }

  /**
   * Method used to edit monitor data in the database
   * @param {Number} id database identifier which we want to edit
   * @param {Object} data monitor object which we want to add to database
   * @returns updated monitor object
   */
  static async editMonitor(id, data) {
    const { parent, enable, threshold, condition, notifier } = data;
    const { rows } = await DatabaseQuery(
      `UPDATE ${
        MonitorService.#DB_TABLE_NAME
      } SET parent = $1, enable = $2, threshold = $3, condition = $4, notifier = $5 WHERE id = $6 RETURNING *`,
      [parent, enable, threshold, condition, notifier, id]
    );
    return rows[0];
  }

  /**
   * Method used to delete monitor data from the database
   * @param {Number} id database identifier which we want to remove
   * @returns number of deleted monitor object(s)
   */
  static async deleteMonitor(id) {
    const { rowCount } = await DatabaseQuery(`DELETE FROM ${MonitorService.#DB_TABLE_NAME} WHERE id = $1`, [id]);
    return rowCount > 0;
  }
}
