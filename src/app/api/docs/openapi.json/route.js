import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const OPENAPI_ROOT_PATH = path.join(process.cwd(), "openapi", "openapi.json");

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
 * @param {Map<String, unknown>} cache
 * @returns {Promise<unknown>}
 */
async function resolveNode(node, baseFilePath, rootDocument, cache) {
  if (Array.isArray(node)) {
    const resolvedItems = [];
    for (const item of node) {
      resolvedItems.push(await resolveNode(item, baseFilePath, rootDocument, cache));
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
      return resolveNode(pointerTarget, OPENAPI_ROOT_PATH, rootDocument, cache);
    }

    if (ref.startsWith("./")) {
      const targetPath = path.resolve(path.dirname(baseFilePath), ref);
      const cacheKey = `${baseFilePath}::${ref}`;
      if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
      }
      const raw = await fs.readFile(targetPath, "utf8");
      const targetObject = JSON.parse(raw);
      const resolvedTarget = await resolveNode(targetObject, targetPath, rootDocument, cache);
      cache.set(cacheKey, resolvedTarget);
      return resolvedTarget;
    }

    throw new Error(`Unsupported $ref value: ${ref}`);
  }

  const output = {};
  for (const [key, value] of Object.entries(node)) {
    output[key] = await resolveNode(value, baseFilePath, rootDocument, cache);
  }
  return output;
}

/**
 * Build a fully resolved OpenAPI document from split JSON files.
 * @returns {Promise<Object>}
 */
async function buildBundledOpenApiDocument() {
  const rawRoot = await fs.readFile(OPENAPI_ROOT_PATH, "utf8");
  const rootDocument = JSON.parse(rawRoot);
  const cache = new Map();
  const resolvedDocument = await resolveNode(rootDocument, OPENAPI_ROOT_PATH, rootDocument, cache);
  return resolvedDocument;
}

export async function GET() {
  try {
    const openApiDocument = await buildBundledOpenApiDocument();
    return new Response(JSON.stringify(openApiDocument, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const output = {
      message: `Cannot load OpenAPI specification: ${error.message}`,
    };
    return new Response(JSON.stringify(output), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }
}
