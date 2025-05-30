export class AppConfig {
  static getConfig() {
    return {
      scraper: {
        host: process.env.SCRAPER_HOST || "localhost",
        port: parseInt(process.env.SCRAPER_PORT) || 5000,
      },
    };
  }
}
