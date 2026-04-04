import { UserService } from "../../src/model/UserService.js";
import { authorizeUser } from "../../src/lib/ApiUserAuth.js";

jest.mock("../../src/model/UserService.js", () => ({
  UserService: {
    filterUsers: jest.fn(),
  },
}));

describe("authorizeUser", () => {
  beforeEach(() => {
    UserService.filterUsers.mockReset();
  });

  function requestWithAuth(value) {
    return {
      headers: {
        get: jest.fn(() => value),
      },
    };
  }

  test("throws 400 for invalid user id", async () => {
    await expect(authorizeUser(requestWithAuth("Bearer jwt"), "bad")).rejects.toMatchObject({
      message: "Invalid user ID.",
      status: 400,
    });
  });

  test("throws 401 when bearer token is missing", async () => {
    await expect(authorizeUser(requestWithAuth(""), 7)).rejects.toMatchObject({
      message: "Missing or invalid authorization header.",
      status: 401,
    });
  });

  test("throws 403 when user authorization fails", async () => {
    UserService.filterUsers.mockResolvedValueOnce([]);

    await expect(authorizeUser(requestWithAuth("Bearer jwt-1"), 7)).rejects.toMatchObject({
      message: "User authorization failed.",
      status: 403,
    });
    expect(UserService.filterUsers).toHaveBeenCalledWith({ id: 7, jwt: "jwt-1" });
  });

  test("returns user id when authorization succeeds", async () => {
    UserService.filterUsers.mockResolvedValueOnce([{ id: 7 }]);

    const result = await authorizeUser(requestWithAuth("Bearer jwt-1"), "7");

    expect(result).toBe(7);
    expect(UserService.filterUsers).toHaveBeenCalledWith({ id: 7, jwt: "jwt-1" });
  });
});
