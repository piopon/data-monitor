import { render, screen } from "@testing-library/react";

import GuestAccess from "../../src/components/GuestAccess.jsx";
import { LoginContext } from "../../src/context/Contexts.jsx";

const replaceMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

describe("GuestAccess", () => {
  beforeEach(() => {
    replaceMock.mockReset();
  });

  test("renders nothing when auth is not ready", () => {
    const { container } = render(
      <LoginContext.Provider value={{ authReady: false, userLogged: false }}>
        <GuestAccess>
          <div>guest-content</div>
        </GuestAccess>
      </LoginContext.Provider>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  test("redirects logged user to monitors", () => {
    const { container } = render(
      <LoginContext.Provider value={{ authReady: true, userLogged: true }}>
        <GuestAccess>
          <div>guest-content</div>
        </GuestAccess>
      </LoginContext.Provider>,
    );

    expect(replaceMock).toHaveBeenCalledWith("/monitors");
    expect(container).toBeEmptyDOMElement();
  });

  test("renders children for guest user", () => {
    render(
      <LoginContext.Provider value={{ authReady: true, userLogged: false }}>
        <GuestAccess>
          <div>guest-content</div>
        </GuestAccess>
      </LoginContext.Provider>,
    );

    expect(screen.getByText("guest-content")).toBeInTheDocument();
  });
});
