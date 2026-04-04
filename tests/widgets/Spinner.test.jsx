import { render, screen } from "@testing-library/react";

import Spinner from "../../src/widgets/Spinner.jsx";

jest.mock("react-spinners", () => ({
  ClipLoader: ({ loading, size, speedMultiplier, color }) => (
    <div
      data-testid="clip-loader"
      data-loading={String(loading)}
      data-size={size}
      data-speed-multiplier={speedMultiplier}
      data-color={color}
    />
  ),
}));

describe("Spinner", () => {
  test("renders loading message and passes expected props to ClipLoader", () => {
    render(<Spinner loading={true} />);

    const loader = screen.getByTestId("clip-loader");
    expect(loader).toBeInTheDocument();
    expect(loader).toHaveAttribute("data-loading", "true");
    expect(loader).toHaveAttribute("data-size", "50px");
    expect(loader).toHaveAttribute("data-speed-multiplier", "1.1");
    expect(loader).toHaveAttribute("data-color", "var(--color-indigo-600)");
    expect(screen.getByText("loading...")).toBeInTheDocument();
  });
});
