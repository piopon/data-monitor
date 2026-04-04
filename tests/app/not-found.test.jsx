import { render, screen } from "@testing-library/react";

import NotFound from "../../src/app/not-found.js";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children }) => <a href={href}>{children}</a>,
}));

describe("app/not-found", () => {
  test("renders 404 page and home link", () => {
    render(<NotFound />);

    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "return to home" })).toHaveAttribute("href", "/");
  });
});
