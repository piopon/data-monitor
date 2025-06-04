import pg from "pg";

const database = new pg.Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
});

database.connect();
database.on("error", (err) => {
    console.error("Unexpected error on idle client", err);
    process.exit(-1);
  });

export const DatabaseQuery = (text, params) => database.query(text, params);
