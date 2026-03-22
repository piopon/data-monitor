import { DatabaseQuery } from "../lib/DatabaseQuery.js";
import { DataCrypto } from "../lib/DataCrypto.js";
import { Notifier } from "./Notifier.js";

export class NotifierService {
  static #DB_TABLE_NAME = Notifier.getTableName();

  /**
   * Method used to initialize database table for notifier data
   * @returns object with initialize result and detailed info message
   */
  static async initializeTable() {
    try {
      await DatabaseQuery(`
      CREATE TABLE IF NOT EXISTS ${NotifierService.#DB_TABLE_NAME} (
        ${Notifier.getDatabaseSchema()}
      );`);
      return { result: true, message: `Initialized '${NotifierService.#DB_TABLE_NAME}' table.` };
    } catch (error) {
      return { result: false, message: `Cannot initialize '${NotifierService.#DB_TABLE_NAME}' table: ${error.message}.` };
    }
  }

  /**
   * Method used to receive all notifiers saved in database
   * @returns array of notifier objects from database
   */
  static async getNotifiers() {
    const { rows } = await DatabaseQuery(`SELECT * FROM ${NotifierService.#DB_TABLE_NAME}`);
    return rows.map((row) => NotifierService.#toPublicNotifier(row));
  }

  /**
   * Method used to receive notifiers matching provided filter expression
   * @param {String} query expression used to filter notifier objects
   * @returns array of notifier objects matching filter expression
   */
  static async filterNotifiers(filters) {
    const values = [];
    const conditions = [];
    let originFilter = undefined;
    let passwordFilter = undefined;

    if (filters.id) {
      values.push(filters.id);
      conditions.push(`id = $${values.length}`);
    }
    if (filters.type) {
      values.push(filters.type);
      conditions.push(`type = $${values.length}`);
    }
    if (filters.origin) {
      originFilter = filters.origin;
    }
    if (filters.sender) {
      values.push(filters.sender);
      conditions.push(`sender = $${values.length}`);
    }
    if (filters.password) {
      passwordFilter = filters.password;
    }
    // Prevent unbounded scans when filtering by sensitive values.
    if ((originFilter != null || passwordFilter != null) && conditions.length === 0) {
      throw new Error("Origin/password filter requires at least one non-sensitive filter (id, type or sender).");
    }
    const whereClause = conditions.length > 0 ? "WHERE " + conditions.join(" AND ") : "";
    const { rows } = await DatabaseQuery(`SELECT * FROM ${NotifierService.#DB_TABLE_NAME} ${whereClause}`, values);
    let notifiers = rows.map((row) => NotifierService.#toPublicNotifier(row));
    if (originFilter != null) {
      notifiers = notifiers.filter((notifier) => notifier.origin === originFilter);
    }
    if (passwordFilter != null) {
      notifiers = notifiers.filter((notifier) => notifier.password === passwordFilter);
    }
    return notifiers;
  }

  /**
   * Method used to add provided notifier data to database
   * @param {Object} data notifier object which we want to add to database
   * @returns added notifier object
   */
  static async addNotifier(data) {
    const { type, origin, sender, password } = data;
    const encryptedOrigin = DataCrypto.encrypt(origin);
    const encryptedPassword = DataCrypto.encrypt(password);
    const { rows } = await DatabaseQuery(
      `INSERT INTO ${NotifierService.#DB_TABLE_NAME} (type, origin, sender, password) VALUES ($1, $2, $3, $4) RETURNING *`,
      [type, encryptedOrigin, sender, encryptedPassword]
    );
    return NotifierService.#toPublicNotifier(rows[0]);
  }

  /**
   * Method used to edit notifier data in the database
   * @param {Number} id database identifier which we want to edit
   * @param {Object} data notifier object which we want to add to database
   * @returns updated notifier object
   */
  static async editNotifier(id, data) {
    const { type, origin, sender, password } = data;
    const { rows: existingRows } = await DatabaseQuery(
      `SELECT origin, password FROM ${NotifierService.#DB_TABLE_NAME} WHERE id = $1`,
      [id]
    );
    if (existingRows.length === 0) {
      return undefined;
    }
    const current = existingRows[0];
    const encryptedOrigin = NotifierService.#hasSensitiveInput(origin)
      ? DataCrypto.encrypt(origin)
      : current.origin;
    const encryptedPassword = NotifierService.#hasSensitiveInput(password)
      ? DataCrypto.encrypt(password)
      : current.password;
    const { rows } = await DatabaseQuery(
      `UPDATE ${NotifierService.#DB_TABLE_NAME} SET type = $1, origin = $2, sender = $3, password = $4 WHERE id = $5 RETURNING *`,
      [type, encryptedOrigin, sender, encryptedPassword, id]
    );
    return NotifierService.#toPublicNotifier(rows[0]);
  }

  /**
   * Method used to delete notifier data from the database
   * @param {Number} id database identifier which we want to remove
   * @returns number of deleted notifier object(s)
   */
  static async deleteNotifier(id) {
    const { rowCount } = await DatabaseQuery(`DELETE FROM ${NotifierService.#DB_TABLE_NAME} WHERE id = $1`, [id]);
    return rowCount > 0;
  }

  /**
   * Method used to migrate plain-text sensitive values to encrypted payload format
   * @param {Object} options Migration options
   * @param {Boolean} options.reencrypt Indicates whether encrypted values should be re-encrypted using active key
   * @returns number of updated rows
   */
  static async migrateSensitiveData(options = {}) {
    const reencrypt = options.reencrypt === true;
    const query = reencrypt
      ? `SELECT id, origin, password
         FROM ${NotifierService.#DB_TABLE_NAME}
         WHERE (origin IS NOT NULL AND origin <> '')
            OR (password IS NOT NULL AND password <> '')`
      : `SELECT id, origin, password
         FROM ${NotifierService.#DB_TABLE_NAME}
         WHERE (origin IS NOT NULL AND origin <> '' AND origin NOT LIKE 'enc:%')
            OR (password IS NOT NULL AND password <> '' AND password NOT LIKE 'enc:%')`;
    const { rows } = await DatabaseQuery(query);
    let updatedRows = 0;
    for (const row of rows) {
      const hasOrigin = row?.origin != null && row.origin !== "";
      const hasPassword = row?.password != null && row.password !== "";
      if (!hasOrigin && !hasPassword) {
        continue;
      }
      if (reencrypt) {
        const shouldRotateOrigin = hasOrigin && DataCrypto.needsReencryption(row.origin);
        const shouldRotatePassword = hasPassword && DataCrypto.needsReencryption(row.password);
        if (!shouldRotateOrigin && !shouldRotatePassword) {
          continue;
        }
        const encryptedOrigin = shouldRotateOrigin ? DataCrypto.reencryptToActive(row.origin) : row.origin;
        const encryptedPassword = shouldRotatePassword ? DataCrypto.reencryptToActive(row.password) : row.password;
        await DatabaseQuery(`UPDATE ${NotifierService.#DB_TABLE_NAME} SET origin = $1, password = $2 WHERE id = $3`, [
          encryptedOrigin,
          encryptedPassword,
          row.id,
        ]);
        updatedRows += 1;
        continue;
      }
      const hasPlainOrigin = hasOrigin && !DataCrypto.isEncrypted(row.origin);
      const hasPlainPassword = hasPassword && !DataCrypto.isEncrypted(row.password);
      if (!hasPlainOrigin && !hasPlainPassword) {
        continue;
      }
      const encryptedOrigin = hasPlainOrigin ? DataCrypto.encrypt(row.origin) : row.origin;
      const encryptedPassword = hasPlainPassword ? DataCrypto.encrypt(row.password) : row.password;
      await DatabaseQuery(`UPDATE ${NotifierService.#DB_TABLE_NAME} SET origin = $1, password = $2 WHERE id = $3`, [
        encryptedOrigin,
        encryptedPassword,
        row.id,
      ]);
      updatedRows += 1;
    }
    return updatedRows;
  }

  /**
   * Method used to convert database notifier row into response-safe model shape
   * @param {Object} row Raw database row
   * @returns notifier object with decoded sensitive fields
   */
  static #toPublicNotifier(row) {
    if (row == null) {
      return row;
    }
    return {
      ...row,
      origin: DataCrypto.decrypt(row.origin),
      password: DataCrypto.decrypt(row.password),
    };
  }

  /**
   * Method used to verify whether new sensitive input should overwrite stored secret
   * @param {String} value New input value for sensitive field
   * @returns true when value should be treated as a replacement, false otherwise
   */
  static #hasSensitiveInput(value) {
    return value != null && String(value) !== "";
  }
}
