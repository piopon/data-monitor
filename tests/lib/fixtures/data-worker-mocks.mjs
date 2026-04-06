const params = new URL(import.meta.url).searchParams;

const validatorMode = params.get("validator") || "valid";
const waitOnMode = params.get("waitOn") || "ok";
const usersMode = params.get("users") || "empty";

export class NotifierValidator {
  static validateConfiguration() {
    if (validatorMode === "invalid") {
      return { result: false, info: "forced invalid configuration" };
    }
    return { result: true, info: "forced valid configuration" };
  }
}

export default async function waitOn(options = {}) {
  if (waitOnMode === "reject") {
    throw new Error("wait-on smoke failure");
  }
  const resources = Array.isArray(options.resources) ? options.resources.join(",") : "";
  console.log(`wait-on ok: ${resources}`);
}

export class UserService {
  static async getUsers() {
    if (usersMode === "reject") {
      throw new Error("users fetch smoke failure");
    }
    return [];
  }
}