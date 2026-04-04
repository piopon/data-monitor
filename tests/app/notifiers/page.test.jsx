import { render, screen, waitFor } from "@testing-library/react";

import Notifiers from "../../../src/app/notifiers/page.js";
import { PageContext } from "../../../src/context/Contexts.jsx";

jest.mock("@/components/UserAccess", () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="user-access">{children}</div>,
}));

jest.mock("@/views/NotifiersPage", () => ({
  __esModule: true,
  default: () => <div data-testid="notifiers-view">notifiers</div>,
}));

describe("app/notifiers/page", () => {
  test("sets page id to notifiers and renders page inside UserAccess", async () => {
    const setPageId = jest.fn();

    render(
      <PageContext.Provider value={{ setPageId }}>
        <Notifiers />
      </PageContext.Provider>,
    );

    await waitFor(() => {
      expect(setPageId).toHaveBeenCalledWith("notifiers");
    });
    expect(screen.getByTestId("user-access")).toBeInTheDocument();
    expect(screen.getByTestId("notifiers-view")).toBeInTheDocument();
  });
});
