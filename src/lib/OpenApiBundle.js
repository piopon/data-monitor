import fs from "node:fs/promises";
import path from "node:path";

/**
 * Convert unknown thrown values into a safe message string.
 * @param {unknown} error
 * @returns {String}
 */
export function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }
  if (error == null) {
    return "Unknown error";
  }
  return String(error);
}

/**
 * Resolve a JSON pointer against a document object.
 * @param {Object} documentObject
 * @param {String} pointer
 * @returns {unknown}
 */
function resolveJsonPointer(documentObject, pointer) {
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
 * Resolve local refs recursively to produce a single bundled document.
 * @param {unknown} node
 * @param {String} baseFilePath
 * @param {Object} rootDocument
 * @param {String} rootFilePath
 * @param {Map<String, unknown>} cache
 * @returns {Promise<unknown>}
 */
async function resolveNode(node, baseFilePath, rootDocument, rootFilePath, cache) {
  if (Array.isArray(node)) {
    const resolvedItems = [];
    for (const item of node) {
      resolvedItems.push(await resolveNode(item, baseFilePath, rootDocument, rootFilePath, cache));
    }
    return resolvedItems;
  }

  if (node == null || typeof node !== "object") {
    return node;
  }

  if (typeof node.$ref === "string") {
    const ref = node.$ref;
    if (ref.startsWith("#/")) {
      const pointerTarget = resolveJsonPointer(rootDocument, ref);
      return resolveNode(pointerTarget, rootFilePath, rootDocument, rootFilePath, cache);
    }

    if (ref.startsWith("./")) {
      const targetPath = path.resolve(path.dirname(baseFilePath), ref);
      const cacheKey = `${baseFilePath}::${ref}`;
      if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
      }
      const raw = await fs.readFile(targetPath, "utf8");
      const targetObject = JSON.parse(raw);
      const resolvedTarget = await resolveNode(targetObject, targetPath, rootDocument, rootFilePath, cache);
      cache.set(cacheKey, resolvedTarget);
      return resolvedTarget;
    }

    throw new Error(`Unsupported $ref value: ${ref}`);
  }

  const output = {};
  for (const [key, value] of Object.entries(node)) {
    output[key] = await resolveNode(value, baseFilePath, rootDocument, rootFilePath, cache);
  }
  return output;
}

/**
 * Build a fully resolved OpenAPI document from split JSON files.
 * @param {String} openApiEntryFile
 * @returns {Promise<Object>}
 */
export async function bundleOpenApiDocumentFromFile(openApiEntryFile) {
  const rawRoot = await fs.readFile(openApiEntryFile, "utf8");
  const rootDocument = JSON.parse(rawRoot);
  return resolveNode(rootDocument, openApiEntryFile, rootDocument, openApiEntryFile, new Map());
}
