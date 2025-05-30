export class AppConfig {
  static getConfig() {
    return {
      scraper: {
        host: process.env.SCRAPER_HOST || "localhost",
        port: parseInt(process.env.SCRAPER_PORT) || 5000,
      },
      database: {
        host: process.env.DB_HOST || "localhost",
        name: process.env.DB_NAME || "data-monitor",
        port: parseInt(process.env.DB_PORT) || 27017,
        user: process.env.DB_USER || "",
        password: process.env.DB_PASSWORD || "",
      },
    };
  }
}
