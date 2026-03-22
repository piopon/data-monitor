import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

export class DataCrypto {
  static #ALGORITHM = "aes-256-gcm";
  static #FORMAT_PREFIX = "enc";
  static #FORMAT_VERSION = "v1";
  static #IV_BYTE_LENGTH = 12;
  static #AUTH_TAG_BYTE_LENGTH = 16;
  static #KEY_BYTE_LENGTH = 32;
  static #SALT = "data-monitor-sensitive-data-v1";
  static #cachedKey = undefined;

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
        // Input only looks encrypted; treat it as plain text and encrypt safely.
      }
    }
    const key = DataCrypto.#getKey();
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
    const key = DataCrypto.#getKey();
    const decipher = createDecipheriv(DataCrypto.#ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(payload), decipher.final()]);
    return decrypted.toString("utf8");
  }

  /**
   * Method used to fail-fast when sensitive data key is not configured correctly
   */
  static assertConfigured() {
    DataCrypto.#getKey();
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
   * Method used to lazily derive and cache an encryption key from environment secret
   * @returns Buffer containing encryption key
   */
  static #getKey() {
    if (DataCrypto.#cachedKey) {
      return DataCrypto.#cachedKey;
    }
    const secretRaw = process.env.CRYPTO_SECRET;
    if (typeof secretRaw !== "string") {
      throw new Error("Missing or invalid CRYPTO_SECRET environment variable.");
    }
    const secret = secretRaw.trim();
    if (secret.length < 16) {
      throw new Error("Weak CRYPTO_SECRET environment variable value.");
    }
    DataCrypto.#cachedKey = scryptSync(secret, DataCrypto.#SALT, DataCrypto.#KEY_BYTE_LENGTH);
    return DataCrypto.#cachedKey;
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
