import { UserService } from "@/model/UserService";
import { DataSanitizer } from "@/lib/DataSanitizer";
import { RequestUtils } from "@/lib/RequestUtils";

const PRIVATE_PLACEHOLDER = "PRIVATE";

/**
 * Method used to normalize placeholder values before persisting sensitive fields
 * @param {String} value Input value received from client
 * @returns normalized value suitable for service layer updates
 */
function normalizeSensitiveInput(value) {
  return value === PRIVATE_PLACEHOLDER ? "" : value;
}

/**
 * Method used to sanitize user email values at API boundary
 * @param {unknown} value Raw email input
 * @returns sanitized email value when valid, empty string otherwise
 */
function sanitizeUserEmail(value) {
  return DataSanitizer.sanitizeEmail(typeof value === "string" ? value : "");
}

/**
 * Method used to validate user jwt values without mutating credential content
 * @param {unknown} value Raw jwt input
 * @returns validated jwt string
 */
function validateUserJwt(value) {
  if (value == null) {
    return "";
  }
  const input = String(value);
  const hasDisallowedChars =
    /[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u2028\u2029\u202A-\u202E\u2060-\u206F\uFEFF]/.test(input);
  if (hasDisallowedChars) {
    const error = new Error("Invalid user JWT: contains disallowed control characters.");
    error.status = 400;
    throw error;
  }
  return input;
}

/**
 * Method used to normalize GET query filters for user route
 * @param {URLSearchParams} searchParams User query parameters
 * @returns normalized filter object
 */
function normalizeUserFilters(searchParams) {
  const id = searchParams.get("id");
  const email = sanitizeUserEmail(searchParams.get("email"));
  const jwt = validateUserJwt(searchParams.get("jwt"));
  const hasIndexedFilter = Boolean(id || email);
  return {
    ...(id && { id }),
    ...(email && { email }),
    ...(hasIndexedFilter && jwt && { jwt }),
  };
}

/**
 * Method used to normalize incoming user payload before save/update operations
 * @param {Object} user Input user payload from request body
 * @param {Object} options Normalization behavior flags
 * @param {Boolean} options.requireEmail Indicates whether non-empty email is required
 * @param {Boolean} options.requireJwt Indicates whether non-empty jwt is required
 * @returns normalized user payload
 */
function normalizeUserInput(user, options = {}) {
  if (user == null) {
    return user;
  }
  const requireJwt = options.requireJwt === true;
  const normalizedJwt = normalizeSensitiveInput(user.jwt);
  const sanitizedJwt = validateUserJwt(normalizedJwt);
  if (requireJwt && !sanitizedJwt) {
    const error = new Error("User JWT is required.");
    error.status = 400;
    throw error;
  }
  if (user.jwt != null && normalizedJwt !== "" && !sanitizedJwt) {
    const error = new Error("Invalid user JWT.");
    error.status = 400;
    throw error;
  }
  const requireEmail = options.requireEmail === true;
  const sanitizedEmail = user.email != null ? sanitizeUserEmail(user.email) : "";
  if (requireEmail && !sanitizedEmail) {
    const error = new Error("User email is required.");
    error.status = 400;
    throw error;
  }
  if (user.email != null && !sanitizedEmail) {
    const error = new Error("Invalid user email.");
    error.status = 400;
    throw error;
  }
  return {
    ...user,
    email: sanitizedEmail,
    jwt: sanitizedJwt,
  };
}

/**
 * Method used to mask sensitive user fields in API responses
 * @param {Object} user User object returned by service layer
 * @returns user object with masked sensitive fields
 */
function getSafeUser(user) {
  if (user == null) {
    return user;
  }
  return {
    ...user,
    jwt: user.jwt ? PRIVATE_PLACEHOLDER : "",
  };
}

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    if (0 === searchParams.size) {
      const users = await UserService.getUsers();
      return new Response(JSON.stringify(users.map((user) => getSafeUser(user))), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    const users = await UserService.filterUsers({
      ...normalizeUserFilters(searchParams),
    });
    return new Response(JSON.stringify(users.map((user) => getSafeUser(user))), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorOutput = { message: `Cannot get users: ${error.message}` };
    return new Response(JSON.stringify(errorOutput), {
      status: RequestUtils.getErrorStatus(error),
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(request) {
  try {
    const userData = normalizeUserInput(await request.json(), { requireEmail: true, requireJwt: true });
    const user = await UserService.addUser(userData);
    return new Response(JSON.stringify(getSafeUser(user)), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorOutput = { message: `Cannot add new user: ${error.message}` };
    return new Response(JSON.stringify(errorOutput), {
      status: RequestUtils.getErrorStatus(error),
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PUT(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const userData = normalizeUserInput(await request.json(), { requireEmail: false, requireJwt: false });
    const user = await UserService.editUser(id, userData);
    return new Response(JSON.stringify(getSafeUser(user)), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorOutput = { message: `Cannot update user: ${error.message}` };
    return new Response(JSON.stringify(errorOutput), {
      status: RequestUtils.getErrorStatus(error),
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function DELETE(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");
    const deletedNo = await UserService.deleteUser(id);
    const response = { message: `Deleted ${deletedNo} user(s)` };
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorOutput = { message: `Cannot delete user: ${error.message}` };
    return new Response(JSON.stringify(errorOutput), {
      status: RequestUtils.getErrorStatus(error),
      headers: { "Content-Type": "application/json" },
    });
  }
}
