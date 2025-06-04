import { DatabaseQuery } from "@/lib/DatabaseQuery";
import { Monitor } from "./Monitor";

export const initialize = async () => {
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
};
