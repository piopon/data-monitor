import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const loaderParams = new URL(import.meta.url).searchParams;
const scenario = loaderParams.get("scenario") || "startup-success-empty-users";

const scenarioModes = {
  "invalid-validator": { validator: "invalid", waitOn: "ok", users: "empty" },
  "waiton-reject": { validator: "valid", waitOn: "reject", users: "empty" },
  "startup-success-empty-users": { validator: "valid", waitOn: "ok", users: "empty" },
  "users-reject": { validator: "valid", waitOn: "ok", users: "reject" },
};

const mode = scenarioModes[scenario] || scenarioModes["startup-success-empty-users"];

const FIXTURE_DIR = path.dirname(fileURLToPath(import.meta.url));
const MOCKS_BASE_URL = pathToFileURL(path.join(FIXTURE_DIR, "data-worker-dependency-mocks.mjs")).href;

function getMockUrl(specifier) {
  if (specifier === "../notifiers/core/NotifierValidator.js") {
    return `${MOCKS_BASE_URL}?validator=${mode.validator}`;
  }
  if (specifier === "wait-on") {
    return `${MOCKS_BASE_URL}?waitOn=${mode.waitOn}`;
  }
  if (specifier === "../model/UserService.js") {
    return `${MOCKS_BASE_URL}?users=${mode.users}`;
  }
  return null;
}

export async function resolve(specifier, context, defaultResolve) {
  const mockUrl = getMockUrl(specifier);
  if (mockUrl) {
    return { url: mockUrl, shortCircuit: true };
  }
  return defaultResolve(specifier, context, defaultResolve);
}
