export class ModelUtils {
  static isEmpty(object) {
    return Object.keys(object).length === 0;
  }

  getValueOrDefault(value, defaultValue) {
    return value == null ? defaultValue : value;
  }
}
