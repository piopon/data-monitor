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
          logout: process.env.SCRAPER_URL_LOGOUT || "/auth/logout",
          data: process.env.SCRAPER_URL_DATA || "/api/v1/data",
          items: process.env.SCRAPER_URL_ITEMS || "/api/v1/data/items",
          edit: process.env.SCRAPER_URL_EDIT || "?challenge=",
          features: process.env.SCRAPER_URL_FEATURES || "/api/v1/settings/features",
        },
      },
      database: {
        host: process.env.DB_HOST || "localhost",
        name: process.env.DB_NAME || "data-monitor",
        port: parseInt(process.env.DB_PORT) || 27017,
        user: process.env.DB_USER || "",
        password: process.env.DB_PASSWORD || "",
      },
      notifier: {
        email: {
          service: process.env.NOTIFIER_MAIL_SERVICE || "gmail",
          address: process.env.NOTIFIER_MAIL_ADDRESS || "",
          password: process.env.NOTIFIER_MAIL_PASSWORD || "",
        },
        discord: {
          name: process.env.NOTIFIER_DISCORD_NAME || "data-monitor",
          avatar: process.env.NOTIFIER_DISCORD_AVATAR || "",
          webhook: process.env.NOTIFIER_DISCORD_HOOK || "",
        }
      }
    };
  }
}
