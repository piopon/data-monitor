import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

export class DataCrypto {
  static #ALGORITHM = "aes-256-gcm";
  static #FORMAT_PREFIX = "enc";
  static #FORMAT_VERSION = "v1";
  static #IV_BYTE_LENGTH = 12;
  static #AUTH_TAG_BYTE_LENGTH = 16;
  static #KEY_BYTE_LENGTH = 32;
  static #SALT = "data-monitor-sensitive-data-v1";
  static #cachedCryptoConfig = undefined;

  /**
   * Method used to verify if input value is encoded with app sensitive-data format
   * @param {String} value Input value to verify
   * @returns true when value has supported encrypted payload format, false otherwise
   */
  static isEncrypted(value) {
    if (typeof value !== "string") {
      return false;
    }
    const parts = String(value).split(":");
    if (parts.length !== 5) {
      return false;
    }
    const [prefix, version, iv, authTag, payload] = parts;
    if (prefix !== DataCrypto.#FORMAT_PREFIX || version !== DataCrypto.#FORMAT_VERSION) {
      return false;
    }
    if (!DataCrypto.#isValidBase64Url(iv) || !DataCrypto.#isValidBase64Url(authTag) || !DataCrypto.#isValidBase64Url(payload)) {
      return false;
    }
    try {
      const ivBuffer = Buffer.from(iv, "base64url");
      const authTagBuffer = Buffer.from(authTag, "base64url");
      const payloadBuffer = Buffer.from(payload, "base64url");
      return (
        ivBuffer.length === DataCrypto.#IV_BYTE_LENGTH &&
        authTagBuffer.length === DataCrypto.#AUTH_TAG_BYTE_LENGTH &&
        payloadBuffer.length > 0 &&
        ivBuffer.toString("base64url") === iv &&
        authTagBuffer.toString("base64url") === authTag &&
        payloadBuffer.toString("base64url") === payload
      );
    } catch {
      return false;
    }
  }

  /**
   * Method used to encode sensitive value using authenticated encryption
   * @param {String} value Input value to encrypt
   * @returns encrypted value payload preserving input empty/null values
   */
  static encrypt(value) {
    if (value == null || value === "") {
      return value;
    }
    if (DataCrypto.isEncrypted(value)) {
      try {
        DataCrypto.decrypt(value);
        return value;
      } catch {
        // input only looks encrypted - treat it as plain text and encrypt safely
      }
    }
    const key = DataCrypto.#getActiveKey();
    const iv = randomBytes(DataCrypto.#IV_BYTE_LENGTH);
    const cipher = createCipheriv(DataCrypto.#ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(String(value), "utf8"), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return DataCrypto.#encodePayload(iv, authTag, encrypted);
  }

  /**
   * Method used to decode sensitive value that was encrypted using app format
   * @param {String} value Input value to decrypt
   * @returns decrypted value payload preserving input empty/plaintext values
   */
  static decrypt(value) {
    if (value == null || value === "") {
      return value;
    }
    if (!DataCrypto.isEncrypted(value)) {
      return value;
    }
    const { iv, authTag, payload } = DataCrypto.#decodePayload(value);
    const decryptKeys = DataCrypto.#getDecryptKeys();
    for (const key of decryptKeys) {
      try {
        const decrypted = DataCrypto.#decryptPayload(payload, iv, authTag, key);
        return decrypted.toString("utf8");
      } catch {
        // try next configured key
      }
    }
    throw new Error("Cannot decrypt payload with configured CRYPTO_SECRET / CRYPTO_LEGACY_SECRETS values.");
  }

  /**
   * Method used to verify whether value should be re-encrypted with currently active key
   * @param {String} value Input value to verify
   * @returns true when value should be re-encrypted, false otherwise
   */
  static needsReencryption(value) {
    if (value == null || value === "") {
      return false;
    }
    if (!DataCrypto.isEncrypted(value)) {
      return true;
    }
    const { iv, authTag, payload } = DataCrypto.#decodePayload(value);
    try {
      DataCrypto.#decryptPayload(payload, iv, authTag, DataCrypto.#getActiveKey());
      return false;
    } catch {
      // value might have been encrypted with one of legacy keys
    }
    const legacyKeys = DataCrypto.#getDecryptKeys().slice(1);
    for (const key of legacyKeys) {
      try {
        DataCrypto.#decryptPayload(payload, iv, authTag, key);
        return true;
      } catch {
        // try next legacy key
      }
    }
    throw new Error("Cannot verify re-encryption state for payload with configured keys.");
  }

  /**
   * Method used to re-encrypt data with currently active key configuration
   * @param {String} value Input value to re-encrypt
   * @returns value encrypted with active key
   */
  static reencryptToActive(value) {
    if (value == null || value === "") {
      return value;
    }
    if (!DataCrypto.needsReencryption(value)) {
      return value;
    }
    const plainValue = DataCrypto.decrypt(value);
    return DataCrypto.encrypt(plainValue);
  }

  /**
   * Method used to fail-fast when sensitive data key is not configured correctly
   */
  static assertConfigured() {
    DataCrypto.#getCryptoConfig();
  }

  /**
   * Method used to serialize encrypted binary data into a versioned text payload
   * @param {Buffer} iv Initialization vector used during encryption
   * @param {Buffer} authTag Authentication tag produced by AES-GCM
   * @param {Buffer} payload Encrypted binary payload
   * @returns string payload suitable for storing in database text columns
   */
  static #encodePayload(iv, authTag, payload) {
    return [
      DataCrypto.#FORMAT_PREFIX,
      DataCrypto.#FORMAT_VERSION,
      iv.toString("base64url"),
      authTag.toString("base64url"),
      payload.toString("base64url"),
    ].join(":");
  }

  /**
   * Method used to parse and validate a versioned encrypted text payload
   * @param {String} value Encrypted text payload from database
   * @returns object with parsed iv, authTag and encrypted payload buffers
   */
  static #decodePayload(value) {
    const parts = String(value).split(":");
    if (parts.length !== 5) {
      throw new Error("Invalid encrypted payload format.");
    }
    const [prefix, version, iv, authTag, payload] = parts;
    if (prefix !== DataCrypto.#FORMAT_PREFIX || version !== DataCrypto.#FORMAT_VERSION) {
      throw new Error("Unsupported encrypted payload format.");
    }
    try {
      return {
        iv: Buffer.from(iv, "base64url"),
        authTag: Buffer.from(authTag, "base64url"),
        payload: Buffer.from(payload, "base64url"),
      };
    } catch {
      throw new Error("Invalid encrypted payload encoding.");
    }
  }

  /**
   * Method used to decrypt binary payload with provided encryption key
   * @param {Buffer} payload Encrypted binary payload
   * @param {Buffer} iv Initialization vector used during encryption
   * @param {Buffer} authTag Authentication tag produced by AES-GCM
   * @param {Buffer} key Encryption key to use
   * @returns Buffer containing decrypted value
   */
  static #decryptPayload(payload, iv, authTag, key) {
    const decipher = createDecipheriv(DataCrypto.#ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(payload), decipher.final()]);
  }

  /**
   * Method used to return currently active encryption key
   * @returns Buffer containing active encryption key
   */
  static #getActiveKey() {
    return DataCrypto.#getCryptoConfig().activeKey;
  }

  /**
   * Method used to return all configured decryption keys (active first, then legacy)
   * @returns array containing decryption keys
   */
  static #getDecryptKeys() {
    return DataCrypto.#getCryptoConfig().decryptKeys;
  }

  /**
   * Method used to lazily derive and cache active/legacy keys from environment
   * @returns object with active key and decryption keys list
   */
  static #getCryptoConfig() {
    if (DataCrypto.#cachedCryptoConfig) {
      return DataCrypto.#cachedCryptoConfig;
    }
    const secretRaw = process.env.CRYPTO_SECRET;
    if (typeof secretRaw !== "string") {
      throw new Error("Missing or invalid CRYPTO_SECRET environment variable.");
    }
    const activeSecret = secretRaw.trim();
    if (activeSecret.length < 16) {
      throw new Error("Weak CRYPTO_SECRET environment variable value.");
    }
    const activeKey = DataCrypto.#deriveKey(activeSecret);
    const decryptKeys = [activeKey];
    const legacySecrets = DataCrypto.#parseLegacySecrets(process.env.CRYPTO_LEGACY_SECRETS);
    legacySecrets.forEach((legacySecret) => {
      const legacyKey = DataCrypto.#deriveKey(legacySecret);
      if (!decryptKeys.some((key) => key.equals(legacyKey))) {
        decryptKeys.push(legacyKey);
      }
    });
    DataCrypto.#cachedCryptoConfig = { activeKey, decryptKeys };
    return DataCrypto.#cachedCryptoConfig;
  }

  /**
   * Method used to parse CRYPTO_LEGACY_SECRETS from supported formats
   * @param {String} rawSecrets Legacy secrets from environment
   * @returns array of normalized legacy secrets
   */
  static #parseLegacySecrets(rawSecrets) {
    if (typeof rawSecrets !== "string" || rawSecrets.trim().length === 0) {
      return [];
    }
    const normalized = rawSecrets.trim();
    if (normalized.startsWith("[")) {
      try {
        const parsed = JSON.parse(normalized);
        if (!Array.isArray(parsed)) {
          throw new Error("CRYPTO_LEGACY_SECRETS JSON must be an array of strings.");
        }
        return parsed
          .map((secret) => String(secret).trim())
          .filter((secret) => secret.length > 0);
      } catch (error) {
        throw new Error(`Cannot parse CRYPTO_LEGACY_SECRETS: ${error.message}`);
      }
    }
    return normalized
      .split(",")
      .map((secret) => secret.trim())
      .filter((secret) => secret.length > 0);
  }

  /**
   * Method used to derive key material from plain-text secret
   * @param {String} secret Secret value used as key input
   * @returns Buffer containing derived key
   */
  static #deriveKey(secret) {
    return scryptSync(secret, DataCrypto.#SALT, DataCrypto.#KEY_BYTE_LENGTH);
  }

  /**
   * Method used to verify if input can be represented as base64url text
   * @param {String} value Input value to verify
   * @returns true when input is a valid base64url candidate, false otherwise
   */
  static #isValidBase64Url(value) {
    if (typeof value !== "string" || value.length === 0) {
      return false;
    }
    return /^[A-Za-z0-9_-]+$/.test(value);
  }
}
