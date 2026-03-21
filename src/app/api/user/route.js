import { UserService } from "@/model/UserService";

const PRIVATE_PLACEHOLDER = "PRIVATE";

function normalizeSensitiveInput(value) {
  return value === PRIVATE_PLACEHOLDER ? "" : value;
}

function normalizeUserInput(user) {
  if (user == null) {
    return user;
  }
  return {
    ...user,
    jwt: normalizeSensitiveInput(user.jwt),
  };
}

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
    const id = searchParams.get("parent");
    const email = searchParams.get("enabled");
    const jwt = searchParams.get("threshold");
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
