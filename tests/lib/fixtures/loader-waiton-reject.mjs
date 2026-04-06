import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const FIXTURE_DIR = path.dirname(fileURLToPath(import.meta.url));
const MOCKS_BASE_URL = pathToFileURL(path.join(FIXTURE_DIR, "data-worker-mocks.mjs")).href;

export async function resolve(specifier, context, defaultResolve) {
  if (specifier === "../notifiers/core/NotifierValidator.js") {
    return { url: `${MOCKS_BASE_URL}?validator=valid`, shortCircuit: true };
  }
  if (specifier === "wait-on") {
    return { url: `${MOCKS_BASE_URL}?waitOn=reject`, shortCircuit: true };
  }
  return defaultResolve(specifier, context, defaultResolve);
}
