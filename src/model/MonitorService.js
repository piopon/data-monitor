import { DatabaseQuery } from "../lib/DatabaseQuery.js";
import { Monitor } from "./Monitor.js";

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
      return {
        result: false,
        message: `Cannot initialize '${MonitorService.#DB_TABLE_NAME}' table: ${error.message}.`,
      };
    }
  }

  /**
   * Method used to receive monitors matching provided filter expression
   * @param {String} filters expression used to filter monitor objects
   * @returns array of monitor objects matching filter expression
   */
  static async filterMonitors(filters) {
    const values = [];
    const conditions = [];

    if (filters.id) {
      values.push(filters.id);
      conditions.push(`id = $${values.length}`);
    }
    if (filters.parent) {
      values.push(filters.parent);
      conditions.push(`parent = $${values.length}`);
    }
    if (filters.enabled) {
      values.push(filters.enabled);
      conditions.push(`enabled = $${values.length}`);
    }
    if (filters.interval) {
      values.push(filters.interval);
      conditions.push(`interval = $${values.length}`);
    }
    if (filters.threshold) {
      values.push(filters.threshold);
      conditions.push(`threshold = $${values.length}`);
    }
    if (filters.condition) {
      values.push(filters.condition);
      conditions.push(`condition = $${values.length}`);
    }
    if (filters.notifier) {
      values.push(filters.notifier);
      conditions.push(`notifier_id = $${values.length}`);
    }
    if (filters.user) {
      values.push(filters.user);
      conditions.push(`user_id = $${values.length}`);
    }
    const whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";
    const { rows } = await DatabaseQuery(`SELECT * FROM ${MonitorService.#DB_TABLE_NAME} ${whereClause}`, values);
    return rows;
  }

  /**
   * Method used to add provided monitor data to database
   * @param {Object} data monitor object which we want to add to database
   * @returns added monitor object
   */
  static async addMonitor(data) {
    const { parent, enabled, threshold, condition, notifier, interval, user } = data;
    const { rows } = await DatabaseQuery(
      `INSERT INTO ${
        MonitorService.#DB_TABLE_NAME
      } (parent, enabled, threshold, condition, notifier_id, interval, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [parent, enabled, threshold, condition, notifier, interval, user]
    );
    return rows[0];
  }

  /**
   * Method used to edit monitor data for a specific user ownership scope
   * @param {Number} id monitor identifier to edit
   * @param {Number} userId owner identifier used for authorization scope
   * @param {Object} data monitor object which we want to update in database
   * @returns updated monitor object
   */
  static async editMonitorForUser(id, userId, data) {
    const { parent, enabled, threshold, condition, notifier, interval } = data;
    const { rows } = await DatabaseQuery(
      `UPDATE ${
        MonitorService.#DB_TABLE_NAME
      } SET parent = $1, enabled = $2, threshold = $3, condition = $4, notifier_id = $5, interval = $6 WHERE id = $7 AND user_id = $8 RETURNING *`,
      [parent, enabled, threshold, condition, notifier, interval, id, userId]
    );
    return rows[0];
  }

  /**
   * Method used to delete monitor data for a specific user ownership scope
   * @param {Number} id monitor identifier to remove
   * @param {Number} userId owner identifier used for authorization scope
   * @returns true when monitor row was deleted, false otherwise
   */
  static async deleteMonitorForUser(id, userId) {
    const { rowCount } = await DatabaseQuery(`DELETE FROM ${MonitorService.#DB_TABLE_NAME} WHERE id = $1 AND user_id = $2`, [
      id,
      userId,
    ]);
    return rowCount > 0;
  }
}
