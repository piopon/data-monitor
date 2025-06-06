import { DatabaseQuery } from "@/lib/DatabaseQuery";
import { Monitor } from "./Monitor";

export class MonitorService {
  /**
   * Method used to initialize database table for monitor data
   */
  static async initializeDbTable() {
    const tableName = Monitor.getTableName();
    try {
      await DatabaseQuery(`
      CREATE TABLE IF NOT EXISTS ${tableName} (
        ${Monitor.getDatabaseSchema()}
      );`);
      return { result: true, message: `Initialized '${tableName}' table.` };
    } catch (error) {
      return { result: false, message: `Cannot initialize '${tableName}' table: ${error.message}` };
    }
  }

  static async getMonitors() {
    const { rows } = await DatabaseQuery("SELECT * FROM monitor");
    return rows;
  }

  static async getMonitors(searchTerm) {
    const { rows } = await DatabaseQuery(
      `SELECT * FROM monitor WHERE parent ILIKE $1 OR threshold ILIKE $1 OR condition ILIKE $1 OR notifier ILIKE $1`,
      [`%${searchTerm}%`]
    );
    return rows;
  }

  static async createMonitor(data) {
    const { parent, enable, threshold, condition, notifier } = data;
    const { rows } = await DatabaseQuery(
      `INSERT INTO monitor (parent, enable, threshold, condition, notifier) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [parent, enable, threshold, condition, notifier]
    );

    return rows[0];
  }

  static async updateMonitor(id, data) {
    const { parent, enable, threshold, condition, notifier } = data;
    const { rows } = await DatabaseQuery(
      `UPDATE monitor SET parent = $1, enable = $2, threshold = $3, condition = $4, notifier = $5 WHERE id = $6 RETURNING *`,
      [parent, enable, threshold, condition, notifier, id]
    );

    return rows[0];
  }

  static async deleteMonitor(id) {
    const { rowCount } = await DatabaseQuery(`DELETE FROM monitor WHERE id = $1`, [id]);
    return rowCount > 0;
  }
}
