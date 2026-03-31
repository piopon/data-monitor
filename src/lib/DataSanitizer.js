export class DataSanitizer {
  /**
   * Method used to sanitize email for safe single-line logging
   * @param {String} email Raw email value
   * @returns sanitized email value suitable for logs
   */
  static sanitizeEmail(email) {
    if (typeof email !== "string") {
      return "";
    }
    // Strip ASCII control chars (\r, \n, \t, etc.) to prevent log line injection/spoofing.
    return email.replace(/[\u0000-\u001F\u007F]/g, "").trim();
  }
}
