import { GET, POST, PUT, DELETE } from "../../../../src/app/api/user/route.js";
import { UserService } from "@/model/UserService";
import { RequestUtils } from "@/lib/RequestUtils";

jest.mock("@/model/UserService", () => ({
  UserService: {
    getUsers: jest.fn(),
    filterUsers: jest.fn(),
    addUser: jest.fn(),
    editUser: jest.fn(),
    deleteUser: jest.fn(),
  },
}));
jest.mock("@/lib/RequestUtils", () => ({ RequestUtils: { getErrorStatus: jest.fn() } }));

class MockResponse {
  constructor(body, init = {}) {
    this._body = body;
    this.status = init.status ?? 200;
  }
  async json() {
    return JSON.parse(this._body || "null");
  }
}

const reqWithUrl = (url, body) => ({
  nextUrl: new URL(url),
  json: async () => body,
});

describe("app/api/user route", () => {
  const originalResponse = global.Response;

  beforeAll(() => {
    global.Response = MockResponse;
  });

  afterAll(() => {
    global.Response = originalResponse;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    RequestUtils.getErrorStatus.mockImplementation((error, fallbackStatus = 400) => error?.status ?? fallbackStatus);
  });

  test("GET without query returns all users with masked jwt", async () => {
    UserService.getUsers.mockResolvedValue([{ id: 1, email: "a@a.com", jwt: "token" }]);

    const response = await GET(reqWithUrl("http://test/api/user"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual([{ id: 1, email: "a@a.com", jwt: "PRIVATE" }]);
  });

  test("GET with query filters users", async () => {
    UserService.filterUsers.mockResolvedValue([{ id: 2, email: "b@b.com", jwt: "t" }]);

    const response = await GET(reqWithUrl("http://test/api/user?email=b%40b.com"));
    const body = await response.json();

    expect(UserService.filterUsers).toHaveBeenCalledWith({ email: "b@b.com" });
    expect(body).toEqual([{ id: 2, email: "b@b.com", jwt: "PRIVATE" }]);
  });

  test("GET drops jwt filter when sanitized id/email filters are missing", async () => {
    UserService.filterUsers.mockResolvedValue([]);

    await GET(reqWithUrl("http://test/api/user?email=user%0A%40example.com&jwt=abcdef"));

    expect(UserService.filterUsers).toHaveBeenCalledWith({});
  });

  test("GET returns 400 for jwt query with disallowed control characters", async () => {
    const response = await GET(reqWithUrl("http://test/api/user?jwt=abc%0Adef"));
    const body = await response.json();

    expect(UserService.filterUsers).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(body.message).toContain("Invalid user JWT");
  });

  test("GET forwards id/email/jwt query filters together", async () => {
    UserService.filterUsers.mockResolvedValue([{ id: 2, email: "b@b.com", jwt: "t" }]);

    await GET(reqWithUrl("http://test/api/user?id=2&email=b%40b.com&jwt=token"));

    expect(UserService.filterUsers).toHaveBeenCalledWith({ id: "2", email: "b@b.com", jwt: "token" });
  });

  test("POST returns 400 when jwt is missing via PRIVATE placeholder", async () => {
    const response = await POST(reqWithUrl("http://test/api/user", { email: "c@c.com", jwt: "PRIVATE" }));
    const body = await response.json();

    expect(UserService.addUser).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(body.message).toContain("User JWT is required");
  });

  test("POST returns 400 when email is missing", async () => {
    const response = await POST(reqWithUrl("http://test/api/user", { jwt: "token" }));
    const body = await response.json();

    expect(UserService.addUser).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(body.message).toContain("User email is required");
  });

  test("POST returns 400 for invalid sanitized email payload", async () => {
    const response = await POST(reqWithUrl("http://test/api/user", { email: "a b@x.com", jwt: "abc\ndef" }));
    const body = await response.json();

    expect(UserService.addUser).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(body.message).toContain("Invalid user JWT");
  });

  test("POST returns error when payload is null", async () => {
    UserService.addUser.mockImplementation(() => {
      throw new TypeError("Cannot destructure null user payload");
    });

    const response = await POST(reqWithUrl("http://test/api/user", null));
    const body = await response.json();

    expect(UserService.addUser).toHaveBeenCalledWith(null);
    expect(response.status).toBe(400);
    expect(body.message).toContain("Cannot add new user:");
  });

  test("PUT updates user by id", async () => {
    UserService.editUser.mockResolvedValue({ id: 3, email: "c@c.com", jwt: "" });

    const response = await PUT(reqWithUrl("http://test/api/user?id=3", { email: "c@c.com", jwt: "PRIVATE" }));

    expect(response.status).toBe(200);
    expect(UserService.editUser).toHaveBeenCalledWith("3", { email: "c@c.com", jwt: "" });
  });

  test("PUT returns 400 for invalid sanitized JWT payload", async () => {
    const response = await PUT(reqWithUrl("http://test/api/user?id=3", { email: "c@c.com", jwt: "\u202E" }));
    const body = await response.json();

    expect(UserService.editUser).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(body.message).toContain("Invalid user JWT");
  });

  test("PUT returns 400 for invalid sanitized email payload", async () => {
    const response = await PUT(reqWithUrl("http://test/api/user?id=3", { email: "bad email", jwt: "x" }));
    const body = await response.json();

    expect(UserService.editUser).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(body.message).toContain("Invalid user email");
  });

  test("DELETE removes user by id", async () => {
    UserService.deleteUser.mockResolvedValue(1);

    const response = await DELETE(reqWithUrl("http://test/api/user?id=3"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ message: "Deleted 1 user(s)" });
  });

  test("GET returns mapped error status when service throws", async () => {
    UserService.getUsers.mockRejectedValueOnce(Object.assign(new Error("db down"), { status: 503 }));

    const response = await GET(reqWithUrl("http://test/api/user"));
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.message).toContain("Cannot get users: db down");
  });

  test("POST returns mapped error status when service throws", async () => {
    UserService.addUser.mockRejectedValueOnce(Object.assign(new Error("bad payload"), { status: 422 }));

    const response = await POST(reqWithUrl("http://test/api/user", { email: "a@a.com", jwt: "x" }));
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.message).toContain("Cannot add new user: bad payload");
  });

  test("PUT returns mapped error status when service throws", async () => {
    UserService.editUser.mockRejectedValueOnce(Object.assign(new Error("update failed"), { status: 500 }));

    const response = await PUT(reqWithUrl("http://test/api/user?id=3", { email: "c@c.com", jwt: "x" }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toContain("Cannot update user: update failed");
  });
});
