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
