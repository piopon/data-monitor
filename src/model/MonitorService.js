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
}
