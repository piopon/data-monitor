import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import HomePage from "../../src/views/HomePage.jsx";
import { LoginContext } from "../../src/context/Contexts.jsx";

const replaceMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

const toastErrorMock = jest.fn();
const toastSuccessMock = jest.fn();

jest.mock("react-toastify", () => ({
  toast: {
    error: (...args) => toastErrorMock(...args),
    success: (...args) => toastSuccessMock(...args),
  },
}));

describe("HomePage", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    replaceMock.mockReset();
    toastErrorMock.mockReset();
    toastSuccessMock.mockReset();
    global.fetch = jest.fn();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  function renderWithContext(value, props = {}) {
    return render(
      <LoginContext.Provider value={value}>
        <HomePage demoEnabled={false} initError={undefined} {...props} />
      </LoginContext.Provider>,
    );
  }

  function submitCredentials({ email = "user@example.com", password = "secret" } = {}) {
    fireEvent.change(screen.getByPlaceholderText("email"), { target: { value: email } });
    fireEvent.change(screen.getByPlaceholderText("password"), { target: { value: password } });
    fireEvent.click(screen.getByRole("button", { name: "login" }));
  }

  test("shows init error toast when initError is provided", async () => {
    renderWithContext({ demo: jest.fn(), login: jest.fn(), logout: jest.fn() }, { initError: "Init failed" });

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("Init failed");
    });
  });

  test("logs in user and redirects on successful credentials login", async () => {
    const loginMock = jest.fn();

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: "jwt-token" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 7 }),
      });

    renderWithContext({ demo: jest.fn(), login: loginMock, logout: jest.fn() });

    submitCredentials();

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith(7, "user@example.com", { token: "jwt-token" });
      expect(replaceMock).toHaveBeenCalledWith("/monitors");
      expect(toastSuccessMock).toHaveBeenCalledWith("Login successful!");
    });

    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("/api/user?"),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer jwt-token" }),
      }),
    );
    expect(global.fetch.mock.calls[1][0]).toContain("email=user%40example.com");
  });

  test("handles failed credentials login and logs out", async () => {
    const logoutMock = jest.fn();

    global.fetch.mockResolvedValueOnce({
      ok: false,
      text: async () => "invalid credentials",
    });

    renderWithContext({ demo: jest.fn(), login: jest.fn(), logout: logoutMock });

    submitCredentials({ password: "bad" });

    await waitFor(() => {
      expect(logoutMock).toHaveBeenCalledTimes(1);
      expect(toastErrorMock).toHaveBeenCalledWith("invalid credentials");
    });
  });

  test("shows save error and does not redirect when user lookup returns multiple users", async () => {
    const loginMock = jest.fn();

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: "jwt-token" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 1 }, { id: 2 }],
      });

    renderWithContext({ demo: jest.fn(), login: loginMock, logout: jest.fn() });

    submitCredentials();

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("Error: Received multiple user entries.");
      expect(loginMock).not.toHaveBeenCalled();
      expect(replaceMock).not.toHaveBeenCalled();
      expect(toastSuccessMock).not.toHaveBeenCalled();
    });
  });

  test("shows fetch exception when scraper login request throws", async () => {
    global.fetch.mockRejectedValueOnce(new Error("network down"));

    renderWithContext({ demo: jest.fn(), login: jest.fn(), logout: jest.fn() });

    submitCredentials();

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("Error: network down");
      expect(replaceMock).not.toHaveBeenCalled();
      expect(toastSuccessMock).not.toHaveBeenCalled();
    });
  });

  test("shows create-user save error and does not redirect when POST /api/user fails", async () => {
    const loginMock = jest.fn();

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: "jwt-token" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: false,
        text: async () => '{"message":"create failed"}',
      });

    renderWithContext({ demo: jest.fn(), login: loginMock, logout: jest.fn() });

    submitCredentials();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenNthCalledWith(
        3,
        "/api/user",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({ Authorization: "Bearer jwt-token" }),
        }),
      );
      expect(toastErrorMock).toHaveBeenCalledWith("create failed");
      expect(loginMock).not.toHaveBeenCalled();
      expect(replaceMock).not.toHaveBeenCalled();
      expect(toastSuccessMock).not.toHaveBeenCalled();
    });
  });

  test("shows update-user save error and does not redirect when PUT /api/user fails", async () => {
    const loginMock = jest.fn();

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: "jwt-token" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 42 }],
      })
      .mockResolvedValueOnce({
        ok: false,
        text: async () => '{"message":"update failed"}',
      });

    renderWithContext({ demo: jest.fn(), login: loginMock, logout: jest.fn() });

    submitCredentials();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenNthCalledWith(
        3,
        "/api/user?id=42",
        expect.objectContaining({
          method: "PUT",
          headers: expect.objectContaining({ Authorization: "Bearer jwt-token" }),
        }),
      );
      expect(toastErrorMock).toHaveBeenCalledWith("update failed");
      expect(loginMock).not.toHaveBeenCalled();
      expect(replaceMock).not.toHaveBeenCalled();
      expect(toastSuccessMock).not.toHaveBeenCalled();
    });
  });

  test("shows lookup error and does not redirect when GET /api/user fails", async () => {
    const loginMock = jest.fn();

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: "jwt-token" }),
      })
      .mockResolvedValueOnce({
        ok: false,
        text: async () => '{"message":"lookup failed"}',
      });

    renderWithContext({ demo: jest.fn(), login: loginMock, logout: jest.fn() });

    submitCredentials();

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("lookup failed");
      expect(loginMock).not.toHaveBeenCalled();
      expect(replaceMock).not.toHaveBeenCalled();
      expect(toastSuccessMock).not.toHaveBeenCalled();
    });
  });

  test("persists demo user and logs in demo with saved user id", async () => {
    const demoMock = jest.fn();

    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: "header.eyJlbWFpbCI6ImRlbW9AZXhhbXBsZS5jb20ifQ.signature", challenge: "demo-challenge" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 77 }),
      });

    render(
      <LoginContext.Provider value={{ demo: demoMock, login: jest.fn(), logout: jest.fn() }}>
        <HomePage demoEnabled={true} initError={undefined} />
      </LoginContext.Provider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "see" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("/api/user?"),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization:
              "Bearer header.eyJlbWFpbCI6ImRlbW9AZXhhbXBsZS5jb20ifQ.signature",
          }),
        }),
      );
      expect(global.fetch.mock.calls[1][0]).toContain("email=demo%40example.com");
      expect(demoMock).toHaveBeenCalledWith(
        77,
        "demo@example.com",
        expect.objectContaining({ token: expect.any(String) }),
      );
      expect(replaceMock).toHaveBeenCalledWith("/monitors");
      expect(toastSuccessMock).toHaveBeenCalledWith("Login successful!");
    });
  });

  test("fails demo login gracefully when scraper response has no token", async () => {
    const demoMock = jest.fn();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ challenge: "demo-challenge" }),
    });

    render(
      <LoginContext.Provider value={{ demo: demoMock, login: jest.fn(), logout: jest.fn() }}>
        <HomePage demoEnabled={true} initError={undefined} />
      </LoginContext.Provider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "see" }));

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("Demo login response is missing token.");
      expect(demoMock).not.toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(replaceMock).not.toHaveBeenCalled();
      expect(toastSuccessMock).not.toHaveBeenCalled();
    });
  });
});
