import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const VERSION_FILE = "VERSION";
const SHA_PLACEHOLDER = "unknown";
const PACKAGE_JSON_FILE = "package.json";

let resolvedVersion;
let resolvedPackageVersion;

const sanitizeToken = (value) => String(value || "").trim().replace(/\s+/g, "");
const sanitizeErrorMessage = (error) => sanitizeToken(error?.message || String(error || "unknown error"));

const readGitSha = () => {
  const fromEnv = sanitizeToken(process.env.GIT_COMMIT_SHA || process.env.COMMIT_SHA || process.env.SOURCE_VERSION);
  if (fromEnv) {
    return fromEnv;
  }
  try {
    return sanitizeToken(execSync("git rev-parse --short=12 HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString());
  } catch (error) {
    console.warn(`Git SHA unavailable: ${sanitizeErrorMessage(error)}`);
    return "";
  }
};

const readVersionFile = () => {
  try {
    const versionPath = path.join(process.cwd(), VERSION_FILE);
    return sanitizeToken(readFileSync(versionPath, "utf8"));
  } catch (error) {
    console.warn(`VERSION file unavailable: ${sanitizeErrorMessage(error)}`);
    return "";
  }
};

const getPackageVersion = () => {
  if (!resolvedPackageVersion) {
    try {
      const packageJsonPath = path.join(process.cwd(), PACKAGE_JSON_FILE);
      const packageJsonContent = readFileSync(packageJsonPath, "utf8");
      const packageJson = JSON.parse(packageJsonContent);
      resolvedPackageVersion = sanitizeToken(packageJson.version || "0.0.0");
    } catch (error) {
      console.warn(`Failed to read package.json version: ${sanitizeErrorMessage(error)}`);
      resolvedPackageVersion = "0.0.0";
    }
  }
  return resolvedPackageVersion;
};

const computeAppVersion = () => {
  const packageVersion = getPackageVersion();
  const gitSha = readGitSha();
  if (gitSha) {
    return `${packageVersion}+${gitSha}`;
  }
  const versionFromFile = readVersionFile();
  if (versionFromFile) {
    return versionFromFile;
  }
  return packageVersion;
};

/**
 * Resolves application version once per process lifetime.
 * Precedence: git sha > VERSION file > package.json version.
 */
export const getAppVersion = () => {
  if (!resolvedVersion) {
    resolvedVersion = computeAppVersion();
    console.info(`App version: ${resolvedVersion}`);
  }
  return resolvedVersion;
};

export const getAppVersionDetails = () => {
  const value = getAppVersion();
  const packageVersion = getPackageVersion();
  const hasSha = value.startsWith(`${packageVersion}+`);
  return {
    value,
    packageVersion,
    hasSha,
    sha: hasSha ? value.slice(packageVersion.length + 1) : SHA_PLACEHOLDER,
  };
};
