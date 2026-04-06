import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const FIXTURE_DIR = path.dirname(fileURLToPath(import.meta.url));
const VALID_VALIDATOR_URL = pathToFileURL(path.join(FIXTURE_DIR, "mock-validator-valid.mjs")).href;
const WAIT_ON_REJECT_URL = pathToFileURL(path.join(FIXTURE_DIR, "mock-wait-on-reject.mjs")).href;

export async function resolve(specifier, context, defaultResolve) {
  if (specifier === "../notifiers/core/NotifierValidator.js") {
    return { url: VALID_VALIDATOR_URL, shortCircuit: true };
  }
  if (specifier === "wait-on") {
    return { url: WAIT_ON_REJECT_URL, shortCircuit: true };
  }
  return defaultResolve(specifier, context, defaultResolve);
}
