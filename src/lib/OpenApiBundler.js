import fs from "node:fs/promises";
import path from "node:path";

export class OpenApiBundler {
  /**
  * Convert any caught/unknown thrown value into a user-safe message.
  * @param {unknown} error Value received in catch blocks (Error, string, null, etc.).
  * @returns {String} Normalized error message suitable for logs and API responses.
   */
  static getErrorMessage(error) {
    if (error instanceof Error) {
      return error.message;
    }
    if (error == null) {
      return "Unknown error";
    }
    return String(error);
  }

  /**
   * Load and bundle an OpenAPI document by resolving all supported local refs.
   * @param {String} openApiEntryFile Absolute or relative path to the root OpenAPI JSON file.
   * @returns {Promise<Object>} Fully resolved OpenAPI document object.
   */
  static async bundleFromFile(openApiEntryFile) {
    const rawRoot = await fs.readFile(openApiEntryFile, "utf8");
    const rootDocument = JSON.parse(rawRoot);
    return OpenApiBundler.#resolveNode(rootDocument, openApiEntryFile, rootDocument, openApiEntryFile, new Map());
  }

  /**
   * Resolve a JSON Pointer (for example #/components/schemas/Foo) against a document object.
   * @param {Object} documentObject Full root document used as a pointer resolution context.
   * @param {String} pointer JSON pointer string to resolve.
   * @returns {unknown} Resolved value referenced by the pointer.
   */
  static #resolveJsonPointer(documentObject, pointer) {
    if (pointer === "" || pointer === "#") {
      return documentObject;
    }
    if (!pointer.startsWith("#/")) {
      throw new Error(`Unsupported JSON pointer: ${pointer}`);
    }
    const tokens = pointer
      .substring(2)
      .split("/")
      .map((token) => token.replace(/~1/g, "/").replace(/~0/g, "~"));
    let current = documentObject;
    for (const token of tokens) {
      if (current == null || typeof current !== "object" || !(token in current)) {
        throw new Error(`Cannot resolve pointer token '${token}' in '${pointer}'.`);
      }
      current = current[token];
    }
    return current;
  }

  /**
    * Recursively resolve local refs and pointer refs for a node subtree.
    * @param {unknown} node Current value/subtree being processed.
    * @param {String} baseFilePath File path used to resolve relative refs for the current node.
    * @param {Object} rootDocument Parsed root OpenAPI document used for #/ pointer refs.
    * @param {String} rootFilePath File path of the root OpenAPI entry document.
    * @param {Map<String, unknown>} cache In-memory cache preventing repeated file/ref resolution.
    * @returns {Promise<unknown>} Resolved node/subtree.
   */
  static async #resolveNode(node, baseFilePath, rootDocument, rootFilePath, cache) {
    if (Array.isArray(node)) {
      const resolvedItems = [];
      for (const item of node) {
        resolvedItems.push(await OpenApiBundler.#resolveNode(item, baseFilePath, rootDocument, rootFilePath, cache));
      }
      return resolvedItems;
    }

    if (node == null || typeof node !== "object") {
      return node;
    }

    if (typeof node.$ref === "string") {
      const ref = node.$ref;
      if (ref.startsWith("#/")) {
        const pointerTarget = OpenApiBundler.#resolveJsonPointer(rootDocument, ref);
        return OpenApiBundler.#resolveNode(pointerTarget, rootFilePath, rootDocument, rootFilePath, cache);
      }

      if (ref.startsWith("./")) {
        const targetPath = path.resolve(path.dirname(baseFilePath), ref);
        const cacheKey = `${baseFilePath}::${ref}`;
        if (cache.has(cacheKey)) {
          return cache.get(cacheKey);
        }
        const raw = await fs.readFile(targetPath, "utf8");
        const targetObject = JSON.parse(raw);
        const resolvedTarget = await OpenApiBundler.#resolveNode(targetObject, targetPath, rootDocument, rootFilePath, cache);
        cache.set(cacheKey, resolvedTarget);
        return resolvedTarget;
      }

      throw new Error(`Unsupported $ref value: ${ref}`);
    }

    const output = {};
    for (const [key, value] of Object.entries(node)) {
      output[key] = await OpenApiBundler.#resolveNode(value, baseFilePath, rootDocument, rootFilePath, cache);
    }
    return output;
  }
}
