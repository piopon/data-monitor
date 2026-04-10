import fs from "node:fs/promises";
import path from "node:path";
import SwaggerParser from "@apidevtools/swagger-parser";

const workspaceRoot = process.cwd();
const openApiRootDir = path.join(workspaceRoot, "openapi");
const openApiEntryFile = path.join(openApiRootDir, "openapi.json");

async function listJsonFiles(rootDir) {
  const result = [];
  const pending = [rootDir];
  while (pending.length > 0) {
    const current = pending.pop();
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        pending.push(entryPath);
      } else if (entry.isFile() && entry.name.endsWith(".json")) {
        result.push(entryPath);
      }
    }
  }
  return result.sort();
}

async function validateJsonSyntax(files) {
  for (const filePath of files) {
    const content = await fs.readFile(filePath, "utf8");
    try {
      JSON.parse(content);
    } catch (error) {
      throw new Error(`Invalid JSON in ${path.relative(workspaceRoot, filePath)}: ${error.message}`);
    }
  }
}

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
      return resolveNode(pointerTarget, openApiEntryFile, rootDocument, cache);
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

async function main() {
  try {
    await fs.access(openApiRootDir);
    await fs.access(openApiEntryFile);

    const jsonFiles = await listJsonFiles(openApiRootDir);
    if (jsonFiles.length === 0) {
      throw new Error("No JSON files found under openapi/ directory.");
    }

    await validateJsonSyntax(jsonFiles);

    const rootDocument = JSON.parse(await fs.readFile(openApiEntryFile, "utf8"));
    const bundledDocument = await resolveNode(rootDocument, openApiEntryFile, rootDocument, new Map());
    await SwaggerParser.validate(bundledDocument);

    console.log(`OpenAPI validation passed (${jsonFiles.length} JSON files checked).`);
  } catch (error) {
    console.error(`OpenAPI validation failed: ${error.message}`);
    process.exitCode = 1;
  }
}

await main();
