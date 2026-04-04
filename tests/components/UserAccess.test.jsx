import { render, screen } from "@testing-library/react";

import UserAccess from "../../src/components/UserAccess.jsx";
import { LoginContext } from "../../src/context/Contexts.jsx";

const replaceMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

describe("UserAccess", () => {
  beforeEach(() => {
    replaceMock.mockReset();
  });

  test("renders nothing when auth is not ready", () => {
    const { container } = render(
      <LoginContext.Provider value={{ authReady: false, userLogged: false }}>
        <UserAccess>
          <div>user-content</div>
        </UserAccess>
      </LoginContext.Provider>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  test("redirects to home when user is not logged", () => {
    const { container } = render(
      <LoginContext.Provider value={{ authReady: true, userLogged: false }}>
        <UserAccess>
          <div>user-content</div>
        </UserAccess>
      </LoginContext.Provider>,
    );

    expect(replaceMock).toHaveBeenCalledWith("/");
    expect(container).toBeEmptyDOMElement();
  });

  test("renders children for logged user", () => {
    render(
      <LoginContext.Provider value={{ authReady: true, userLogged: true }}>
        <UserAccess>
          <div>user-content</div>
        </UserAccess>
      </LoginContext.Provider>,
    );

    expect(screen.getByText("user-content")).toBeInTheDocument();
  });
});
