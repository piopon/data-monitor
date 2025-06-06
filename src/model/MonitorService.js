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
      return { result: true, message: `Initialized '${tableName}' table.`};
    } catch (error) {
      return { result: false, message: `Cannot initialize '${tableName}' table: ${error.message}`};
    }
  }

  static async getMonitors() {
    const { rows } = await DatabaseQuery("SELECT * FROM monitor");
    return rows;
  }

  static async getMonitor(searchTerm) {
    const { rows } = await query(`SELECT * FROM monitor WHERE name ILIKE $1 OR email ILIKE $1 OR job ILIKE $1`, [
      `%${searchTerm}%`,
    ]);
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
}
