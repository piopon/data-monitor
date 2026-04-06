describe("DataCrypto", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test("encrypts/decrypts plain values and recognizes encrypted payload format", async () => {
    process.env.CRYPTO_SECRET = "super-secure-secret-value-123";
    const { DataCrypto } = await import("../../src/lib/DataCrypto.js");

    const encrypted = DataCrypto.encrypt("hello");

    expect(DataCrypto.isEncrypted("hello")).toBe(false);
    expect(DataCrypto.isEncrypted(encrypted)).toBe(true);
    expect(DataCrypto.decrypt(encrypted)).toBe("hello");
    expect(DataCrypto.needsReencryption(encrypted)).toBe(false);
    expect(DataCrypto.needsReencryption("plain")).toBe(true);
  });

  test("preserves null and empty values", async () => {
    process.env.CRYPTO_SECRET = "super-secure-secret-value-123";
    const { DataCrypto } = await import("../../src/lib/DataCrypto.js");

    expect(DataCrypto.encrypt(null)).toBeNull();
    expect(DataCrypto.encrypt("")).toBe("");
    expect(DataCrypto.decrypt(null)).toBeNull();
    expect(DataCrypto.decrypt("")).toBe("");
  });

  test("decrypts payload with legacy key and re-encrypts to active key", async () => {
    process.env.CRYPTO_SECRET = "legacy-secret-value-123456";
    const { DataCrypto: LegacyDataCrypto } = await import("../../src/lib/DataCrypto.js");
    const encryptedWithLegacy = LegacyDataCrypto.encrypt("rotate-me");

    jest.resetModules();
    process.env.CRYPTO_SECRET = "active-secret-value-123456";
    process.env.CRYPTO_LEGACY_SECRETS = "legacy-secret-value-123456";
    const { DataCrypto } = await import("../../src/lib/DataCrypto.js");

    expect(DataCrypto.decrypt(encryptedWithLegacy)).toBe("rotate-me");
    expect(DataCrypto.needsReencryption(encryptedWithLegacy)).toBe(true);

    const rotated = DataCrypto.reencryptToActive(encryptedWithLegacy);
    expect(DataCrypto.isEncrypted(rotated)).toBe(true);
    expect(DataCrypto.decrypt(rotated)).toBe("rotate-me");
    expect(DataCrypto.needsReencryption(rotated)).toBe(false);
  });

  test("throws when CRYPTO_SECRET is missing", async () => {
    delete process.env.CRYPTO_SECRET;
    const { DataCrypto } = await import("../../src/lib/DataCrypto.js");

    expect(() => DataCrypto.assertConfigured()).toThrow("Missing or invalid CRYPTO_SECRET environment variable.");
  });

  test("throws when CRYPTO_SECRET is too weak", async () => {
    process.env.CRYPTO_SECRET = "short-secret";
    const { DataCrypto } = await import("../../src/lib/DataCrypto.js");

    expect(() => DataCrypto.assertConfigured()).toThrow("Weak CRYPTO_SECRET environment variable value.");
  });

  test("throws when legacy secrets JSON payload is invalid", async () => {
    process.env.CRYPTO_SECRET = "super-secure-secret-value-123";
    process.env.CRYPTO_LEGACY_SECRETS = "[invalid-json";
    const { DataCrypto } = await import("../../src/lib/DataCrypto.js");

    expect(() => DataCrypto.assertConfigured()).toThrow(/Cannot parse CRYPTO_LEGACY_SECRETS/);
  });
});
