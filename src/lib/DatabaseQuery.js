import { AppConfig } from "../config/AppConfig.js";
import { Pool } from "pg";
import { AsyncLocalStorage } from "node:async_hooks";
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

const transactionContext = new AsyncLocalStorage();

export const DatabaseQuery = (text, params) => {
  const context = transactionContext.getStore();
  if (context?.client != null) {
    return context.client.query(text, params);
  }
  return pool.query(text, params);
};

/**
 * Method used to execute operation in a database transaction scope
 * @param {Function} operation async operation executed between BEGIN and COMMIT
 * @returns operation result when transaction commits successfully
 */
export const DatabaseTransaction = async (operation) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await transactionContext.run({ client }, async () => operation());
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
