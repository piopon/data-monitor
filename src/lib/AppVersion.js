import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const VERSION_FILE = "VERSION";
const SHA_PLACEHOLDER = "unknown";
const PACKAGE_JSON_FILE = "package.json";

let resolvedVersion;
let resolvedPackageVersion;
let loggedResolvedVersion = false;
let deferredWarnings = [];

const sanitizeToken = (value) => String(value || "").trim().replace(/\s+/g, "");
const sanitizeErrorMessage = (error) => sanitizeToken(error?.message || String(error || "unknown error"));
const isVerbose = (options) => options?.verbose !== false;

const reportWarning = (options, message) => {
  if (isVerbose(options)) {
    console.warn(message);
    return;
  }
  deferredWarnings.push(message);
};

const flushDeferredWarnings = () => {
  if (deferredWarnings.length === 0) {
    return;
  }
  for (const warningMessage of deferredWarnings) {
    console.warn(warningMessage);
  }
  deferredWarnings = [];
};

const readGitSha = (options) => {
  const fromEnv = sanitizeToken(process.env.GIT_COMMIT_SHA || process.env.COMMIT_SHA || process.env.SOURCE_VERSION);
  if (fromEnv) {
    return fromEnv;
  }
  try {
    return sanitizeToken(execSync("git rev-parse --short=12 HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString());
  } catch (error) {
    reportWarning(options, `Git SHA unavailable: ${sanitizeErrorMessage(error)}`);
    return "";
  }
};

const readVersionFile = (options) => {
  try {
    const versionPath = path.join(process.cwd(), VERSION_FILE);
    return sanitizeToken(readFileSync(versionPath, "utf8"));
  } catch (error) {
    reportWarning(options, `VERSION file unavailable: ${sanitizeErrorMessage(error)}`);
    return "";
  }
};

const getPackageVersion = (options) => {
  if (!resolvedPackageVersion) {
    try {
      const packageJsonPath = path.join(process.cwd(), PACKAGE_JSON_FILE);
      const packageJsonContent = readFileSync(packageJsonPath, "utf8");
      const packageJson = JSON.parse(packageJsonContent);
      resolvedPackageVersion = sanitizeToken(packageJson.version || "0.0.0");
    } catch (error) {
      reportWarning(options, `Failed to read package.json version: ${sanitizeErrorMessage(error)}`);
      resolvedPackageVersion = "0.0.0";
    }
  }
  return resolvedPackageVersion;
};

const computeAppVersion = (options) => {
  const packageVersion = getPackageVersion(options);
  const gitSha = readGitSha(options);
  if (gitSha) {
    return `${packageVersion}+${gitSha}`;
  }
  const versionFromFile = readVersionFile(options);
  if (versionFromFile) {
    return versionFromFile;
  }
  return packageVersion;
};

/**
 * Resolves application version once per process lifetime.
 * Precedence: git sha > VERSION file > package.json version.
 * @param {Object} [options] Optional flags for version retrieval
 * @param {Boolean} [options.verbose=true] Enables warning/info logs when true
 */
export const getAppVersion = (options) => {
  if (!resolvedVersion) {
    resolvedVersion = computeAppVersion(options);
  }
  if (isVerbose(options) && !loggedResolvedVersion) {
    flushDeferredWarnings();
    console.info(`App version: ${resolvedVersion}`);
    loggedResolvedVersion = true;
  }
  return resolvedVersion;
};

export const getAppVersionDetails = (options) => {
  const value = getAppVersion(options);
  const packageVersion = getPackageVersion(options);
  const hasSha = value.startsWith(`${packageVersion}+`);
  return {
    value,
    packageVersion,
    hasSha,
    sha: hasSha ? value.slice(packageVersion.length + 1) : SHA_PLACEHOLDER,
  };
};
