import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

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

  test("shows init error toast when initError is provided", async () => {
    renderWithContext({ demo: jest.fn(), login: jest.fn(), logout: jest.fn() }, { initError: "Init failed" });

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("Init failed");
    });
  });

  test("logs in user and redirects on successful credentials login", async () => {
    const user = userEvent.setup();
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

    await user.type(screen.getByPlaceholderText("email"), "user@example.com");
    await user.type(screen.getByPlaceholderText("password"), "secret");
    await user.click(screen.getByRole("button", { name: "login" }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith(7, "user@example.com", { token: "jwt-token" });
      expect(replaceMock).toHaveBeenCalledWith("/monitors");
      expect(toastSuccessMock).toHaveBeenCalledWith("Login successful!");
    });
  });

  test("handles failed credentials login and logs out", async () => {
    const user = userEvent.setup();
    const logoutMock = jest.fn();

    global.fetch.mockResolvedValueOnce({
      ok: false,
      text: async () => "invalid credentials",
    });

    renderWithContext({ demo: jest.fn(), login: jest.fn(), logout: logoutMock });

    await user.type(screen.getByPlaceholderText("email"), "user@example.com");
    await user.type(screen.getByPlaceholderText("password"), "bad");
    await user.click(screen.getByRole("button", { name: "login" }));

    await waitFor(() => {
      expect(logoutMock).toHaveBeenCalledTimes(1);
      expect(toastErrorMock).toHaveBeenCalledWith("invalid credentials");
    });
  });
});
