import { GET, POST, PUT, DELETE } from "../../../../src/app/api/user/route.js";
import { UserService } from "@/model/UserService";
import { authorizeUser, requireBearerToken } from "@/lib/ApiUserAuth";
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
jest.mock("@/lib/ApiUserAuth", () => ({ authorizeUser: jest.fn(), requireBearerToken: jest.fn() }));
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

const reqWithUrl = (url, body, headers = {}) => {
  const normalizedHeaders = Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [String(key).toLowerCase(), value]),
  );
  return {
    nextUrl: new URL(url),
    headers: {
      get: (name) => normalizedHeaders[String(name).toLowerCase()] ?? null,
    },
    json: async () => body,
  };
};

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
    authorizeUser.mockImplementation(async (_request, userInput) => Number.parseInt(String(userInput), 10));
    requireBearerToken.mockImplementation((request) => {
      const authorization = request.headers?.get("authorization") || "";
      if (!authorization.toLowerCase().startsWith("bearer ")) {
        const error = new Error("Missing or invalid authorization header.");
        error.status = 401;
        throw error;
      }
      const token = authorization.substring(7).trim();
      if (!token) {
        const error = new Error("Missing or invalid authorization header.");
        error.status = 401;
        throw error;
      }
      return token;
    });
    RequestUtils.getErrorStatus.mockImplementation((error, fallbackStatus = 400) => error?.status ?? fallbackStatus);
  });

  test("GET with id filter requires authorization and returns masked jwt", async () => {
    UserService.filterUsers.mockResolvedValue([{ id: 1, email: "a@a.com", jwt: "token" }]);

    const response = await GET(
      reqWithUrl("http://test/api/user?id=1", undefined, { authorization: "Bearer token" }),
    );
    const body = await response.json();

    expect(authorizeUser).toHaveBeenCalledWith(expect.any(Object), "1");
    expect(UserService.filterUsers).toHaveBeenCalledWith({ id: "1" });
    expect(response.status).toBe(200);
    expect(body).toEqual([{ id: 1, email: "a@a.com", jwt: "PRIVATE" }]);
  });

  test("GET with email filter uses bearer token as jwt filter", async () => {
    UserService.filterUsers.mockResolvedValue([{ id: 2, email: "b@b.com", jwt: "t" }]);

    const response = await GET(
      reqWithUrl("http://test/api/user?email=user%40example.com", undefined, { authorization: "Bearer token" }),
    );
    const body = await response.json();

    expect(UserService.filterUsers).toHaveBeenCalledWith({ email: "user@example.com", jwt: "token" });
    expect(body).toEqual([{ id: 2, email: "b@b.com", jwt: "PRIVATE" }]);
  });

  test("GET returns 400 when id/email filters are missing", async () => {
    const response = await GET(reqWithUrl("http://test/api/user"));
    const body = await response.json();

    expect(UserService.filterUsers).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(body.message).toContain("requires either 'id' or 'email' filter");
  });

  test("GET returns 401 when bearer token is missing for email lookup", async () => {
    const response = await GET(reqWithUrl("http://test/api/user?email=user%40example.com"));
    const body = await response.json();

    expect(UserService.filterUsers).not.toHaveBeenCalled();
    expect(response.status).toBe(401);
    expect(body.message).toContain("Missing or invalid authorization header");
  });

  test("GET returns 400 for invalid email filter", async () => {
    const response = await GET(reqWithUrl("http://test/api/user?email=not-an-email", undefined, { authorization: "Bearer t" }));
    const body = await response.json();

    expect(UserService.filterUsers).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(body.message).toContain("Invalid user email filter");
  });

  test("POST returns 400 when jwt is missing via PRIVATE placeholder", async () => {
    const response = await POST(
      reqWithUrl("http://test/api/user", { email: "c@c.com", jwt: "PRIVATE" }, { authorization: "Bearer token" }),
    );
    const body = await response.json();

    expect(UserService.addUser).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(body.message).toContain("User JWT is required");
  });

  test("POST returns 400 when email is missing", async () => {
    const response = await POST(
      reqWithUrl("http://test/api/user", { jwt: "token" }, { authorization: "Bearer token" }),
    );
    const body = await response.json();

    expect(UserService.addUser).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(body.message).toContain("User email is required");
  });

  test("POST returns 400 for invalid sanitized email payload", async () => {
    const response = await POST(
      reqWithUrl("http://test/api/user", { email: "a b@x.com", jwt: "abc\ndef" }, { authorization: "Bearer abc\ndef" }),
    );
    const body = await response.json();

    expect(UserService.addUser).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(body.message).toContain("Invalid user JWT");
  });

  test("POST returns error when payload is null", async () => {
    const response = await POST(reqWithUrl("http://test/api/user", null, { authorization: "Bearer token" }));
    const body = await response.json();

    expect(UserService.addUser).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(body.message).toContain("Invalid user payload");
  });

  test("POST returns 403 when bearer token does not match payload jwt", async () => {
    const response = await POST(
      reqWithUrl("http://test/api/user", { email: "user@example.com", jwt: "token-a" }, { authorization: "Bearer token-b" }),
    );
    const body = await response.json();

    expect(UserService.addUser).not.toHaveBeenCalled();
    expect(response.status).toBe(403);
    expect(body.message).toContain("User authorization failed");
  });

  test("PUT updates user by id", async () => {
    UserService.editUser.mockResolvedValue({ id: 3, email: "c@c.com", jwt: "" });

    const response = await PUT(
      reqWithUrl("http://test/api/user?id=3", { email: "c@c.com", jwt: "PRIVATE" }, { authorization: "Bearer token" }),
    );

    expect(response.status).toBe(200);
    expect(authorizeUser).toHaveBeenCalledWith(expect.any(Object), "3");
    expect(UserService.editUser).toHaveBeenCalledWith(3, { email: "c@c.com", jwt: "" });
  });

  test("PUT returns 400 for invalid sanitized JWT payload", async () => {
    const response = await PUT(
      reqWithUrl("http://test/api/user?id=3", { email: "c@c.com", jwt: "\u202E" }, { authorization: "Bearer token" }),
    );
    const body = await response.json();

    expect(UserService.editUser).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(body.message).toContain("Invalid user JWT");
  });

  test("PUT returns 400 when email is missing", async () => {
    const response = await PUT(
      reqWithUrl("http://test/api/user?id=3", { jwt: "x" }, { authorization: "Bearer x" }),
    );
    const body = await response.json();

    expect(UserService.editUser).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(body.message).toContain("User email is required");
  });

  test("PUT returns 400 for invalid sanitized email payload", async () => {
    const response = await PUT(
      reqWithUrl("http://test/api/user?id=3", { email: "bad email", jwt: "x" }, { authorization: "Bearer x" }),
    );
    const body = await response.json();

    expect(UserService.editUser).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    expect(body.message).toContain("Invalid user email");
  });

  test("DELETE removes user by id", async () => {
    UserService.deleteUser.mockResolvedValue(1);

    const response = await DELETE(reqWithUrl("http://test/api/user?id=3", undefined, { authorization: "Bearer token" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(authorizeUser).toHaveBeenCalledWith(expect.any(Object), "3");
    expect(UserService.deleteUser).toHaveBeenCalledWith(3);
    expect(body).toEqual({ message: "Deleted 1 user(s)" });
  });

  test("GET returns mapped error status when service throws", async () => {
    UserService.filterUsers.mockRejectedValueOnce(Object.assign(new Error("db down"), { status: 503 }));

    const response = await GET(reqWithUrl("http://test/api/user?id=1", undefined, { authorization: "Bearer token" }));
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.message).toContain("Cannot get users: db down");
  });

  test("POST returns mapped error status when service throws", async () => {
    UserService.addUser.mockRejectedValueOnce(Object.assign(new Error("bad payload"), { status: 422 }));

    const response = await POST(
      reqWithUrl("http://test/api/user", { email: "user@example.com", jwt: "x" }, { authorization: "Bearer x" }),
    );
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.message).toContain("Cannot add new user: bad payload");
  });

  test("PUT returns mapped error status when service throws", async () => {
    UserService.editUser.mockRejectedValueOnce(Object.assign(new Error("update failed"), { status: 500 }));

    const response = await PUT(
      reqWithUrl("http://test/api/user?id=3", { email: "c@c.com", jwt: "x" }, { authorization: "Bearer token" }),
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toContain("Cannot update user: update failed");
  });
});
