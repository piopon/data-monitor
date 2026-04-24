import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import NotifiersPage from "../../src/views/NotifiersPage.jsx";
import { LoginContext } from "../../src/context/Contexts.jsx";

jest.mock("@/components/EmptyCards", () => ({
  __esModule: true,
  default: ({ whatToAdd }) => <div data-testid="empty-cards">empty:{whatToAdd}</div>,
}));

jest.mock("@/components/NotifierCard", () => ({
  __esModule: true,
  default: ({ data, onDelete }) => (
    <div data-testid="notifier-card">
      <span>{data.type || "new"}</span>
      <button onClick={() => onDelete(data.id)}>delete</button>
    </div>
  ),
}));

const toastErrorMock = jest.fn();

jest.mock("react-toastify", () => ({
  toast: {
    error: (...args) => toastErrorMock(...args),
  },
}));

describe("NotifiersPage", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    toastErrorMock.mockReset();
    global.fetch = jest.fn();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  function renderWithLogin({ userIdValue = 1, token = "token-1", isDemo = false } = {}) {
    return render(
      <LoginContext.Provider value={{ isDemo, userId: () => userIdValue, token }}>
        <NotifiersPage />
      </LoginContext.Provider>,
    );
  }

  test("fetches notifiers in demo mode using regular auth flow", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    renderWithLogin({ userIdValue: 7357, token: "demo-token", isDemo: true });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(screen.getByRole("button", { name: "add" })).not.toBeDisabled();
    });
  });

  test("shows error when user id is missing", async () => {
    renderWithLogin({ userIdValue: "", token: "token-1" });

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("Missing user ID, please re-login and try again.");
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  test("shows error when token is missing", async () => {
    renderWithLogin({ userIdValue: 2, token: "" });

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("Missing user token, please re-login and try again.");
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  test("renders empty state and allows adding a notifier", async () => {
    const user = userEvent.setup();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    const { container } = renderWithLogin({ userIdValue: 3, token: "token-3" });

    const cardsWrapper = container.querySelector("div.notifier-cards-div");
    expect(cardsWrapper).toBeInTheDocument();
    expect(cardsWrapper.querySelector(".scroll-hint-container")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("empty-cards")).toHaveTextContent("empty:notifier");
    });

    await user.click(screen.getByRole("button", { name: "add" }));

    expect(screen.getByTestId("notifier-card")).toHaveTextContent("new");
  });

  test("disables add button when all notifier types are present and enables after delete", async () => {
    const user = userEvent.setup();

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, type: "email", origin: "x", sender: "a", password: "p" },
        { id: 2, type: "discord", origin: "y", sender: "b", password: "q" },
      ],
    });

    renderWithLogin({ userIdValue: 7, token: "token-7" });

    const addButton = await screen.findByRole("button", { name: "add" });
    await waitFor(() => {
      expect(addButton).toBeDisabled();
      expect(screen.getAllByTestId("notifier-card")).toHaveLength(2);
    });

    await user.click(screen.getAllByRole("button", { name: "delete" })[0]);

    await waitFor(() => {
      expect(addButton).not.toBeDisabled();
      expect(screen.getAllByTestId("notifier-card")).toHaveLength(1);
    });
  });

  test("shows API message when notifier fetch returns a non-ok response", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      text: async () => '{"message":"notifiers unavailable"}',
    });

    renderWithLogin({ userIdValue: 4, token: "token-4" });

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("notifiers unavailable");
    });
  });

  test("shows fetch failure message when notifier request throws", async () => {
    global.fetch.mockRejectedValueOnce(new Error("timeout"));

    renderWithLogin({ userIdValue: 5, token: "token-5" });

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("Failed to get notifier data: timeout");
    });
  });
});
