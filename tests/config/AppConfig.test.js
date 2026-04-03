import { AppConfig } from "../../src/config/AppConfig.js";

const APP_CONFIG_ENV_KEYS = [
  "SCRAPER_HOST",
  "SCRAPER_PORT",
  "NEXT_PUBLIC_SCRAPER_URL",
  "SCRAPER_URL_LOGIN",
  "SCRAPER_URL_LOGOUT",
  "SCRAPER_URL_DATA",
  "SCRAPER_URL_ITEMS",
  "SCRAPER_URL_EDIT",
  "SCRAPER_URL_FEATURES",
  "DB_HOST",
  "DB_NAME",
  "DB_PORT",
  "DB_USER",
  "DB_PASS",
  "NOTIFIER_DISCORD_AVATAR",
];

function withEnv(overrides, callback) {
  const previousValues = new Map();
  for (const key of APP_CONFIG_ENV_KEYS) {
    previousValues.set(key, process.env[key]);
  }

  try {
    for (const key of APP_CONFIG_ENV_KEYS) {
      delete process.env[key];
    }
    Object.assign(process.env, overrides);
    callback();
  } finally {
    for (const key of APP_CONFIG_ENV_KEYS) {
      const previous = previousValues.get(key);
      if (previous === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = previous;
      }
    }
  }
}

test("AppConfig.getConfig returns expected defaults", () => {
  withEnv({}, () => {
    const config = AppConfig.getConfig();

    expect(config.scraper.host).toBe("localhost");
    expect(config.scraper.port).toBe(5000);
    expect(config.scraper.public).toBeNull();
    expect(config.scraper.endpoints.login).toBe("/auth/token");
    expect(config.scraper.endpoints.logout).toBe("/auth/logout");
    expect(config.scraper.endpoints.data).toBe("/api/v1/data");
    expect(config.scraper.endpoints.items).toBe("/api/v1/data/items");
    expect(config.scraper.endpoints.edit).toBe("?challenge=");
    expect(config.scraper.endpoints.features).toBe("/api/v1/settings/features");

    expect(config.database.host).toBe("localhost");
    expect(config.database.name).toBe("data-monitor");
    expect(config.database.port).toBe(5432);
    expect(config.database.user).toBe("");
    expect(config.database.password).toBe("");

    expect(config.notifier.discord.avatar).toBe("");
  });
});

test("AppConfig.getConfig applies environment overrides", () => {
  withEnv(
    {
      SCRAPER_HOST: "scraper.internal",
      SCRAPER_PORT: "6001",
      NEXT_PUBLIC_SCRAPER_URL: "https://scraper.example.com",
      SCRAPER_URL_LOGIN: "/custom/login",
      SCRAPER_URL_LOGOUT: "/custom/logout",
      SCRAPER_URL_DATA: "/custom/data",
      SCRAPER_URL_ITEMS: "/custom/items",
      SCRAPER_URL_EDIT: "/custom/edit?challenge=",
      SCRAPER_URL_FEATURES: "/custom/features",
      DB_HOST: "db.internal",
      DB_NAME: "monitoring",
      DB_PORT: "6543",
      DB_USER: "monitor_user",
      DB_PASS: "monitor_pass",
      NOTIFIER_DISCORD_AVATAR: "https://cdn.example.com/avatar.png",
    },
    () => {
      const config = AppConfig.getConfig();

      expect(config.scraper.host).toBe("scraper.internal");
      expect(config.scraper.port).toBe(6001);
      expect(config.scraper.public).toBe("https://scraper.example.com");
      expect(config.scraper.endpoints.login).toBe("/custom/login");
      expect(config.scraper.endpoints.logout).toBe("/custom/logout");
      expect(config.scraper.endpoints.data).toBe("/custom/data");
      expect(config.scraper.endpoints.items).toBe("/custom/items");
      expect(config.scraper.endpoints.edit).toBe("/custom/edit?challenge=");
      expect(config.scraper.endpoints.features).toBe("/custom/features");

      expect(config.database.host).toBe("db.internal");
      expect(config.database.name).toBe("monitoring");
      expect(config.database.port).toBe(6543);
      expect(config.database.user).toBe("monitor_user");
      expect(config.database.password).toBe("monitor_pass");

      expect(config.notifier.discord.avatar).toBe("https://cdn.example.com/avatar.png");
    },
  );
});
