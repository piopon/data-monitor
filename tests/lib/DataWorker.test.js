import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const testDir = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(testDir, "../..");
const DATA_WORKER_FILE = path.resolve(PROJECT_ROOT, "src/lib/DataWorker.js");

function runDataWorkerWithLoader(loaderRelativePath, env = {}, timeout = 5_000) {
  const loaderPath = path.resolve(PROJECT_ROOT, loaderRelativePath);
  const loaderUrl = pathToFileURL(loaderPath).href;
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
    const result = runDataWorkerWithLoader("tests/fixtures/dataworker/loader-invalid-validator.mjs");

    expect(result.status).toBe(1);
    expect(result.error).toBeUndefined();
  });

  test("fails fast when wait-on rejects during startup", () => {
    const result = runDataWorkerWithLoader("tests/fixtures/dataworker/loader-waiton-reject.mjs");

    expect(result.status).not.toBe(0);
    expect(`${result.stdout}\n${result.stderr}`).toContain("wait-on smoke failure");
  });
});
