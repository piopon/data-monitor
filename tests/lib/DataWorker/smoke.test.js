import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const testDir = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(testDir, "../../..");
const DATA_WORKER_FILE = path.resolve(PROJECT_ROOT, "src/lib/DataWorker.js");
const DATA_WORKER_LOADER_FILE = path.resolve(PROJECT_ROOT, "tests/lib/DataWorker/scenarios/loader.mjs");

function runDataWorkerScenario(scenario, env = {}, timeout = 5_000) {
  const loaderUrl = `${pathToFileURL(DATA_WORKER_LOADER_FILE).href}?scenario=${encodeURIComponent(scenario)}`;
  return spawnSync(process.execPath, ["--loader", loaderUrl, DATA_WORKER_FILE], {
    cwd: PROJECT_ROOT,
    env: {
      ...process.env,
      SERVER_URL: "127.0.0.1",
      SERVER_PORT: "3000",
      CHECK_DELAY: "1",
      CHECK_WAIT: "1",
      CHECK_INTERVAL: "10",
      ...env,
    },
    encoding: "utf8",
    timeout,
  });
}

describe("DataWorker smoke", () => {
  test("exits with code 1 when notifier validation fails", () => {
    const result = runDataWorkerScenario("invalid-validator");

    expect(result.status).toBe(1);
    expect(result.error).toBeUndefined();
  });

  test("fails fast when wait-on rejects during startup", () => {
    const result = runDataWorkerScenario("waiton-reject");

    expect(result.status).not.toBe(0);
    expect(`${result.stdout}\n${result.stderr}`).toContain("wait-on smoke failure");
  });

  test("starts cleanly when validator and wait-on pass and there are no users", () => {
    const result = runDataWorkerScenario("startup-success-empty-users");
    const combinedOutput = `${result.stdout}\n${result.stderr}`;

    expect(result.status).toBe(0);
    expect(combinedOutput).toContain("wait-on ok: http://");
    expect(combinedOutput).toContain(":3000");
    expect(result.error).toBeUndefined();
  });

  test("logs user retrieval error when getUsers rejects", () => {
    const result = runDataWorkerScenario("users-reject");
    const combinedOutput = `${result.stdout}\n${result.stderr}`;

    expect(result.status).toBe(0);
    expect(combinedOutput).toContain("Cannot get users: Error: users fetch smoke failure");
    expect(combinedOutput).toContain("wait-on ok: http://");
    expect(combinedOutput).toContain(":3000");
  });
});
