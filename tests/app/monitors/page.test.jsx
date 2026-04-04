import { render, screen, waitFor } from "@testing-library/react";

import Monitors from "../../../src/app/monitors/page.js";
import { LoginContext, PageContext } from "../../../src/context/Contexts.jsx";

const toastWarnMock = jest.fn();
const toastErrorMock = jest.fn();

jest.mock("react-toastify", () => ({
  toast: {
    warn: (...args) => toastWarnMock(...args),
    error: (...args) => toastErrorMock(...args),
  },
}));

jest.mock("@/components/UserAccess", () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="user-access">{children}</div>,
}));

jest.mock("@/views/MonitorsPage", () => ({
  __esModule: true,
  default: ({ loading, data }) => <div data-testid="monitors-view">loading:{String(loading)}|count:{data.length}</div>,
}));

describe("app/monitors/page", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
    toastWarnMock.mockReset();
    toastErrorMock.mockReset();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  function renderWithContexts({ login, page }) {
    return render(
      <LoginContext.Provider value={login}>
        <PageContext.Provider value={page}>
          <Monitors />
        </PageContext.Provider>
      </LoginContext.Provider>,
    );
  }

  test("loads data and sets page id", async () => {
    const setPageId = jest.fn();
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => [{ id: 1 }, { id: 2 }] });

    renderWithContexts({
      login: { isDemo: false, token: "jwt" },
      page: { setPageId },
    });

    await waitFor(() => {
      expect(screen.getByTestId("monitors-view")).toHaveTextContent("loading:false|count:2");
    });
    expect(setPageId).toHaveBeenCalledWith("monitors");
  });

  test("shows backend error text for non-demo failed fetch", async () => {
    const setPageId = jest.fn();
    global.fetch.mockResolvedValueOnce({ ok: false, text: async () => "backend error" });

    renderWithContexts({
      login: { isDemo: false, token: "jwt" },
      page: { setPageId },
    });

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("backend error");
      expect(screen.getByTestId("monitors-view")).toHaveTextContent("loading:false|count:0");
    });
  });
});
