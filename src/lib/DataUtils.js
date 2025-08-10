export class DataUtils {
  static nameToId(name) {
    return name.toLowerCase().replace(/\s+/g, "-");
  }
}