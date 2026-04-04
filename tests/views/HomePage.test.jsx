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
        json: async () => ({ message: "create failed" }),
      });

    renderWithContext({ demo: jest.fn(), login: loginMock, logout: jest.fn() });

    submitCredentials();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenNthCalledWith(
        3,
        "/api/user",
        expect.objectContaining({ method: "POST" }),
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
        json: async () => ({ message: "update failed" }),
      });

    renderWithContext({ demo: jest.fn(), login: loginMock, logout: jest.fn() });

    submitCredentials();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenNthCalledWith(
        3,
        "/api/user?id=42",
        expect.objectContaining({ method: "PUT" }),
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
        json: async () => ({ message: "lookup failed" }),
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
});
