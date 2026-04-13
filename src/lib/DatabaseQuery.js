import { AppConfig } from "../config/AppConfig.js";
import { Pool } from "pg";
import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ override: true, quiet: process.env.NODE_ENV === "test" });
}
const databaseConfig = AppConfig.getConfig().database;
const pool = new Pool({
  host: databaseConfig.host,
  port: databaseConfig.port,
  database: databaseConfig.name,
  user: databaseConfig.user,
  password: databaseConfig.password,
});

export const DatabaseQuery = (text, params) => pool.query(text, params);

/**
 * Method used to execute callback in a database transaction scope
 * @param {Function} operation async operation executed between BEGIN and COMMIT
 * @returns operation result when transaction commits successfully
 */
export const DatabaseTransaction = async (operation) => {
  await DatabaseQuery("BEGIN");
  try {
    const result = await operation();
    await DatabaseQuery("COMMIT");
    return result;
  } catch (error) {
    await DatabaseQuery("ROLLBACK");
    throw error;
  }
};
