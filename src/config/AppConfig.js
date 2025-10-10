export class AppConfig {
  /**
   * Method used to receive the application config object
   * @returns Application configuration object
   */
  static getConfig() {
    return {
      scraper: {
        host: process.env.SCRAPER_HOST || "localhost",
        port: parseInt(process.env.SCRAPER_PORT) || 5000,
        public: process.env.NEXT_PUBLIC_SCRAPER_URL || null,
        endpoints: {
          login: process.env.SCRAPER_URL_LOGIN || "/auth/token",
          data: process.env.SCRAPER_URL_DATA || "/api/v1/data",
          items: process.env.SCRAPER_URL_ITEMS || "/api/v1/data/items",
          edit: process.env.SCRAPER_URL_EDIT || "?challenge=",
        },
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
