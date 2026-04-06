import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const FIXTURE_DIR = path.dirname(fileURLToPath(import.meta.url));
const INVALID_VALIDATOR_URL = pathToFileURL(path.join(FIXTURE_DIR, "mock-validator-invalid.mjs")).href;

export async function resolve(specifier, context, defaultResolve) {
  if (specifier === "../notifiers/core/NotifierValidator.js") {
    return { url: INVALID_VALIDATOR_URL, shortCircuit: true };
  }
  return defaultResolve(specifier, context, defaultResolve);
}
