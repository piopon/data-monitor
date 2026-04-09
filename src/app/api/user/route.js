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
 * Method used to sanitize user jwt values at API boundary
 * @param {unknown} value Raw jwt input
 * @returns single-line sanitized jwt string
 */
function sanitizeUserJwt(value) {
  return DataSanitizer.sanitizeTextForLog(typeof value === "string" ? value : "", 2048);
}

/**
 * Method used to normalize GET query filters for user route
 * @param {URLSearchParams} searchParams User query parameters
 * @returns normalized filter object
 */
function normalizeUserFilters(searchParams) {
  const id = searchParams.get("id");
  const email = sanitizeUserEmail(searchParams.get("email"));
  const jwt = sanitizeUserJwt(searchParams.get("jwt"));
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
 * @returns normalized user payload
 */
function normalizeUserInput(user) {
  if (user == null) {
    return user;
  }
  const normalizedJwt = normalizeSensitiveInput(user.jwt);
  const normalized = {
    ...user,
    jwt: sanitizeUserJwt(normalizedJwt),
  };
  if (user.email != null) {
    const sanitizedEmail = sanitizeUserEmail(user.email);
    if (!sanitizedEmail) {
      const error = new Error("Invalid user email.");
      error.status = 400;
      throw error;
    }
    normalized.email = sanitizedEmail;
  }
  return normalized;
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
    const userData = normalizeUserInput(await request.json());
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
    const userData = normalizeUserInput(await request.json());
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
