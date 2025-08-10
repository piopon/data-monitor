export class DataUtils {
  /**
   * Method used to convert provided name to an ID string
   * @param {String} name The name to be converted to an ID string
   * @returns an identifier-compatible string from name
   */
  static nameToId(name) {
    return name.toLowerCase().replace(/\s+/g, "-");
  }
}
