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

  test("POST normalizes PRIVATE jwt input", async () => {
    UserService.addUser.mockResolvedValue({ id: 3, email: "c@c.com", jwt: "" });

    const response = await POST(reqWithUrl("http://test/api/user", { email: "c@c.com", jwt: "PRIVATE" }));
    const body = await response.json();

    expect(UserService.addUser).toHaveBeenCalledWith({ email: "c@c.com", jwt: "" });
    expect(body).toEqual({ id: 3, email: "c@c.com", jwt: "" });
  });

  test("PUT updates user by id", async () => {
    UserService.editUser.mockResolvedValue({ id: 3, email: "c@c.com", jwt: "" });

    const response = await PUT(reqWithUrl("http://test/api/user?id=3", { email: "c@c.com", jwt: "PRIVATE" }));

    expect(response.status).toBe(200);
    expect(UserService.editUser).toHaveBeenCalledWith("3", { email: "c@c.com", jwt: "" });
  });

  test("DELETE removes user by id", async () => {
    UserService.deleteUser.mockResolvedValue(1);

    const response = await DELETE(reqWithUrl("http://test/api/user?id=3"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ message: "Deleted 1 user(s)" });
  });
});
