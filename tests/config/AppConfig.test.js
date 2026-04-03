import test from "node:test";
import assert from "node:assert/strict";

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

    assert.equal(config.scraper.host, "localhost");
    assert.equal(config.scraper.port, 5000);
    assert.equal(config.scraper.public, null);
    assert.equal(config.scraper.endpoints.login, "/auth/token");
    assert.equal(config.scraper.endpoints.logout, "/auth/logout");
    assert.equal(config.scraper.endpoints.data, "/api/v1/data");
    assert.equal(config.scraper.endpoints.items, "/api/v1/data/items");
    assert.equal(config.scraper.endpoints.edit, "?challenge=");
    assert.equal(config.scraper.endpoints.features, "/api/v1/settings/features");

    assert.equal(config.database.host, "localhost");
    assert.equal(config.database.name, "data-monitor");
    assert.equal(config.database.port, 5432);
    assert.equal(config.database.user, "");
    assert.equal(config.database.password, "");

    assert.equal(config.notifier.discord.avatar, "");
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

      assert.equal(config.scraper.host, "scraper.internal");
      assert.equal(config.scraper.port, 6001);
      assert.equal(config.scraper.public, "https://scraper.example.com");
      assert.equal(config.scraper.endpoints.login, "/custom/login");
      assert.equal(config.scraper.endpoints.logout, "/custom/logout");
      assert.equal(config.scraper.endpoints.data, "/custom/data");
      assert.equal(config.scraper.endpoints.items, "/custom/items");
      assert.equal(config.scraper.endpoints.edit, "/custom/edit?challenge=");
      assert.equal(config.scraper.endpoints.features, "/custom/features");

      assert.equal(config.database.host, "db.internal");
      assert.equal(config.database.name, "monitoring");
      assert.equal(config.database.port, 6543);
      assert.equal(config.database.user, "monitor_user");
      assert.equal(config.database.password, "monitor_pass");

      assert.equal(config.notifier.discord.avatar, "https://cdn.example.com/avatar.png");
    },
  );
});
