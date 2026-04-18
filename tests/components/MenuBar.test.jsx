import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import MenuBar from "../../src/components/MenuBar.jsx";
import { LoginContext, PageContext } from "../../src/context/Contexts.jsx";

const pushMock = jest.fn();
const replaceMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
}));

jest.mock("../../src/config/AppConfig.js", () => ({
  AppConfig: {
    getConfig: () => ({
      scraper: {
        public: "http://scraper.local",
        endpoints: { edit: "?challenge=" },
      },
    }),
  },
}));

const toastSuccessMock = jest.fn();
const toastWarnMock = jest.fn();

jest.mock("react-toastify", () => ({
  toast: {
    success: (...args) => toastSuccessMock(...args),
    warn: (...args) => toastWarnMock(...args),
  },
}));

describe("MenuBar", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
    pushMock.mockReset();
    replaceMock.mockReset();
    toastSuccessMock.mockReset();
    toastWarnMock.mockReset();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  function renderWithContexts({ login, page }) {
    return render(
      <LoginContext.Provider value={login}>
        <PageContext.Provider value={page}>
          <MenuBar />
        </PageContext.Provider>
      </LoginContext.Provider>,
    );
  }

  test("shows notifiers button on monitors page", () => {
    renderWithContexts({
      login: { isDemo: false, challenge: "abc", logout: jest.fn(), userId: () => 11, token: "tkn" },
      page: { pageId: "monitors" },
    });

    expect(screen.getByRole("button", { name: "notifiers" })).toBeInTheDocument();
  });

  test("shows monitors button on notifiers page", () => {
    renderWithContexts({
      login: { isDemo: false, challenge: "abc", logout: jest.fn(), userId: () => 11, token: "tkn" },
      page: { pageId: "notifiers" },
    });

    expect(screen.getByRole("button", { name: "monitors" })).toBeInTheDocument();
  });

  test("navigates to scraper config with challenge", () => {
    renderWithContexts({
      login: { isDemo: false, challenge: "abc", logout: jest.fn(), userId: () => 11, token: "tkn" },
      page: { pageId: "monitors" },
    });

    fireEvent.click(screen.getByRole("button", { name: "scraper" }));

    expect(pushMock).toHaveBeenCalledWith("http://scraper.local?challenge=abc");
  });

  test("logs out non-demo user without backend call", async () => {
    const logoutMock = jest.fn();

    renderWithContexts({
      login: { isDemo: false, challenge: "abc", logout: logoutMock, userId: () => 11, token: "tkn" },
      page: { pageId: "monitors" },
    });

    fireEvent.click(screen.getByRole("button", { name: "logout" }));

    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
      expect(logoutMock).toHaveBeenCalled();
      expect(replaceMock).toHaveBeenCalledWith("/");
      expect(toastSuccessMock).toHaveBeenCalledWith("Logout successful!");
    });
  });

  test("demo logout calls scraper logout and user cleanup", async () => {
    global.fetch.mockResolvedValueOnce({ ok: true }).mockResolvedValueOnce({ ok: true });
    const logoutMock = jest.fn();

    renderWithContexts({
      login: { isDemo: true, challenge: "abc", logout: logoutMock, userId: () => 7357, token: "demo-token" },
      page: { pageId: "monitors" },
    });

    fireEvent.click(screen.getByRole("button", { name: "logout" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        "/api/user?id=7357",
        expect.objectContaining({
          method: "DELETE",
          headers: expect.objectContaining({ Authorization: "Bearer demo-token" }),
        }),
      );
      expect(logoutMock).toHaveBeenCalled();
      expect(replaceMock).toHaveBeenCalledWith("/");
      expect(toastSuccessMock).toHaveBeenCalledWith("Logout successful!");
    });
  });

  test("demo logout warns on cleanup issue", async () => {
    global.fetch.mockResolvedValueOnce({ ok: true }).mockResolvedValueOnce({ ok: false });
    const logoutMock = jest.fn();

    renderWithContexts({
      login: { isDemo: true, challenge: "abc", logout: logoutMock, userId: () => 7357, token: "demo-token" },
      page: { pageId: "monitors" },
    });

    fireEvent.click(screen.getByRole("button", { name: "logout" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(logoutMock).toHaveBeenCalled();
      expect(replaceMock).toHaveBeenCalledWith("/");
      expect(toastWarnMock).toHaveBeenCalledWith("Logout successful. Warning: Cannot remove demo user");
    });
  });
});
