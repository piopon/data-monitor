import { UserService } from "@/model/UserService";

/**
 * Method used to parse bearer token from request authorization header
 * @param {Object} request Request object received from frontend
 * @returns token string if present, otherwise null
 */
export function getBearerToken(request) {
  const authorizationHeader = request.headers.get("authorization") || "";
  if (!authorizationHeader.toLowerCase().startsWith("bearer ")) {
    return null;
  }
  const token = authorizationHeader.substring(7).trim();
  return token === "" ? null : token;
}

/**
 * Method used to require bearer token from request authorization header
 * @param {Object} request Request object received from frontend
 * @returns token string
 */
export function requireBearerToken(request) {
  const token = getBearerToken(request);
  if (token == null) {
    const error = new Error("Missing or invalid authorization header.");
    error.status = 401;
    throw error;
  }
  return token;
}

/**
 * Method used to parse and validate user id value from request input
 * @param {String|Number} userInput user identifier from query or body
 * @returns numeric user id
 */
function parseUserId(userInput) {
  const userId = Number.parseInt(String(userInput), 10);
  if (!Number.isInteger(userId) || userId <= 0) {
    const error = new Error("Invalid user ID.");
    error.status = 400;
    throw error;
  }
  return userId;
}

/**
 * Method used to verify request user ownership using bearer token
 * @param {Object} request Request object received from frontend
 * @param {String|Number} userInput user identifier from query or body
 * @returns validated numeric user id
 */
export async function authorizeUser(request, userInput) {
  const userId = parseUserId(userInput);
  const token = requireBearerToken(request);
  const users = await UserService.filterUsers({ id: userId, jwt: token });
  if (users.length !== 1) {
    const error = new Error("User authorization failed.");
    error.status = 403;
    throw error;
  }
  return userId;
}
