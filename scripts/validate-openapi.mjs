import fs from "node:fs/promises";
import path from "node:path";
import SwaggerParser from "@apidevtools/swagger-parser";
import { OpenApiBundler } from "../src/lib/OpenApiBundler.js";

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

async function main() {
  try {
    await fs.access(openApiRootDir);
    await fs.access(openApiEntryFile);

    const jsonFiles = await listJsonFiles(openApiRootDir);
    if (jsonFiles.length === 0) {
      throw new Error("No JSON files found under openapi/ directory.");
    }

    await validateJsonSyntax(jsonFiles);

    const bundledDocument = await OpenApiBundler.bundleFromFile(openApiEntryFile);
    await SwaggerParser.validate(bundledDocument);

    console.log(`OpenAPI validation passed (${jsonFiles.length} JSON files checked).`);
  } catch (error) {
    console.error(`OpenAPI validation failed: ${OpenApiBundler.getErrorMessage(error)}`);
    process.exitCode = 1;
  }
}

await main();
