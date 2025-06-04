export class ModelUtils {
  static isEmpty(object) {
    return Object.keys(object).length === 0;
  }

  getValueOrDefault(value, defaultValue) {
    return value == null ? defaultValue : value;
  }

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

  static #getArray(items) {
    const objs = this.getValueOrDefault(items, []);
    return Array.isArray(objs) ? objs : [objs];
  }

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
