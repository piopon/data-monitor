import { UserService } from "@/model/UserService";

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    if (0 === searchParams.size) {
      const users = await UserService.getUsers();
      return new Response(JSON.stringify(users), {
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
    return new Response(JSON.stringify(users), {
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
