import { DatabaseQuery } from "@/lib/DatabaseQuery";
import { Monitor } from "./Monitor";

export class MonitorService {
  /**
   * Method used to initialize database table for monitor data
   */
  async initializeDbTable() {
    const tableName = Monitor.getTableName();
    try {
      await DatabaseQuery(`
      CREATE TABLE IF NOT EXISTS ${tableName} (
        ${Monitor.getDatabaseSchema()}
      );`);
      console.log(`Initialized '${tableName}' table.`);
    } catch (error) {
      console.error(`Cannot initialize '${tableName}' table: ${error.message}`);
    }
  }
}
