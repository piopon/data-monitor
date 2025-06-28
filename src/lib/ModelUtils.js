export class ModelUtils {
  /**
   * Method used to check if a specified object is empty (has no properties)
   * @param {Object} object The object to check for emptiness
   * @returns true if input object is empty, false otherwise
   */
  static isEmpty(object) {
    return Object.keys(object).length === 0;
  }

  /**
   * Method used to check and return value if present, or a default if not
   * @param {any} value The value to check and return if present
   * @param {any} defaultValue The default value to return if value not present
   * @returns checked value if present, or a default value if not
   */
  static getValueOrDefault(value, defaultValue) {
    return value == null ? defaultValue : value;
  }

  /**
   * Method used to receive an objects array of a specified class
   * @param {any} Clazz The class of objects to return in an array
   * @param {any} items The raw array of objects which we want to convert
   * @returns an array of objects of specified class
   */
  static getArrayOfModels(Clazz, items) {
    const objs = this.#getArray(items);
    let array = [];
    objs.forEach((obj) => {
      if (this.#hasPropertyOf(Clazz, obj)) {
        array.push(new Clazz(obj));
      }
    });
    return array;
  }

  /**
   * Method used to check if the specified object is an instace of a class
   * @param {any} Clazz The reference class which type we want to check
   * @param {any} obj The object to be checked
   * @returns true if object is an instance of a class, false otherwise
   */
  static isInstanceOf(Clazz, obj) {
    if (Clazz == null || obj == null) {
      return false;
    }
    const model = new Clazz();
    const modelKeys = Object.keys(model);
    for (let i = 0, keys = modelKeys; i < keys.length; i++) {
      const key = keys[i];
      if (!Object.prototype.hasOwnProperty.call(obj, key)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Method used to receive a array from specified source
   * @param {any} items The array of items
   * @returns an array of items, or a single item array if input was a single item
   */
  static #getArray(items) {
    const objs = this.getValueOrDefault(items, []);
    return Array.isArray(objs) ? objs : [objs];
  }

  /**
   * Method used to check if the specified object has the attribute of a class
   * @param {any} Clazz The reference class which attribute we want to check
   * @param {any} obj The object which attributes are checked
   * @returns true if object has an attibuter of a class, false otherwise
   */
  static #hasPropertyOf(Clazz, obj) {
    if (Clazz == null || obj == null) {
      return false;
    }
    const model = new Clazz();
    const modelKeys = Object.keys(model);
    for (let i = 0, keys = modelKeys; i < keys.length; i++) {
      const key = keys[i];
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        return true;
      }
    }
    return false;
  }
}
