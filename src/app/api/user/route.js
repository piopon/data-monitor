import { UserService } from "@/model/UserService";

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
 * Method used to normalize incoming user payload before save/update operations
 * @param {Object} user Input user payload from request body
 * @returns normalized user payload
 */
function normalizeUserInput(user) {
  if (user == null) {
    return user;
  }
  return {
    ...user,
    jwt: normalizeSensitiveInput(user.jwt),
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
    const id = searchParams.get("id");
    const email = searchParams.get("email");
    const jwt = searchParams.get("jwt");
    const users = await UserService.filterUsers({
      ...(id && { id }),
      ...(email && { email }),
      ...(jwt && { jwt }),
    });
    return new Response(JSON.stringify(users.map((user) => getSafeUser(user))), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorOutput = { message: `Cannot get users: ${error.message}` };
    return new Response(JSON.stringify(errorOutput), {
      status: 400,
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
      status: 400,
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
      status: 400,
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
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
