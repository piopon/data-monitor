import { render, screen } from "@testing-library/react";

import PageHeader from "../../src/components/PageHeader.jsx";
import { LoginContext } from "../../src/context/Contexts.jsx";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, title, children }) => (
    <a href={href} title={title}>
      {children}
    </a>
  ),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt }) => <div data-testid="next-image">{alt}</div>,
}));

jest.mock("../../src/assets/images/logo-64_outline.png", () => "logo.png");

jest.mock("../../src/components/MenuBar.jsx", () => ({
  __esModule: true,
  default: () => <div data-testid="menu-bar">menu</div>,
}));

describe("PageHeader", () => {
  test("renders logo and version", () => {
    render(
      <LoginContext.Provider value={{ userLogged: false }}>
        <PageHeader appVersion="1.0.0" />
      </LoginContext.Provider>,
    );

    expect(screen.getByTestId("next-image")).toHaveTextContent("data-monitor logo");
    expect(screen.getByText("data-monitor")).toBeInTheDocument();
    expect(screen.getByText("1.0.0")).toBeInTheDocument();
    expect(screen.queryByTestId("menu-bar")).not.toBeInTheDocument();
  });

  test("renders menu when user is logged", () => {
    render(
      <LoginContext.Provider value={{ userLogged: true }}>
        <PageHeader appVersion="1.0.0" />
      </LoginContext.Provider>,
    );

    expect(screen.getByTestId("menu-bar")).toBeInTheDocument();
  });
});
