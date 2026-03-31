export class DataSanitizer {
  /**
   * Method used to sanitize email into a safe, normalized representation
   * @param {String} email Raw email value
   * @returns sanitized email value when valid, empty string otherwise
   */
  static sanitizeEmail(email) {
    if (typeof email !== "string") {
      return "";
    }
    // Normalize and remove non-printable/control chars to prevent injection/spoofing.
    const normalized = email
      .normalize("NFKC")
      .replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g, "")
      .trim()
      .replace(/\s+/g, "");
    const atIndex = normalized.indexOf("@");
    const hasSingleAt = atIndex > 0 && atIndex === normalized.lastIndexOf("@") && atIndex < normalized.length - 1;
    if (!hasSingleAt) {
      return "";
    }
    const localPart = normalized.slice(0, atIndex);
    const domainPart = normalized.slice(atIndex + 1).toLowerCase();
    if (!DataSanitizer.#isSanitizedEmailFormat(localPart, domainPart)) {
      return "";
    }
    return `${localPart}@${domainPart}`;
  }

  /**
   * Method used to validate sanitized email format
   * @param {String} localPart Local email part (before @)
   * @param {String} domainPart Domain email part (after @)
   * @returns true when format is acceptable, false otherwise
   */
  static #isSanitizedEmailFormat(localPart, domainPart) {
    if (!localPart || !domainPart) {
      return false;
    }
    if (localPart.length > 64 || domainPart.length > 255) {
      return false;
    }
    if (localPart.startsWith(".") || localPart.endsWith(".") || localPart.includes("..")) {
      return false;
    }
    if (domainPart.startsWith(".") || domainPart.endsWith(".") || domainPart.includes("..")) {
      return false;
    }
    const localPartPattern = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/;
    if (!localPartPattern.test(localPart)) {
      return false;
    }
    const domainLabels = domainPart.split(".");
    if (domainLabels.length < 2) {
      return false;
    }
    const domainLabelPattern = /^[a-z0-9-]+$/;
    for (const label of domainLabels) {
      if (!label || label.length > 63) {
        return false;
      }
      if (label.startsWith("-") || label.endsWith("-")) {
        return false;
      }
      if (!domainLabelPattern.test(label)) {
        return false;
      }
    }
    return true;
  }
}
