import { render, screen } from "@testing-library/react";

import DataCards from "../../src/components/DataCards.jsx";

jest.mock("@/components/DataCard", () => ({
  __esModule: true,
  default: ({ data }) => <div data-testid="data-card">{data.name}</div>,
}));

describe("DataCards", () => {
  test("renders one DataCard per input item", () => {
    render(<DataCards data={[{ name: "btc" }, { name: "eth" }]} />);

    expect(screen.getAllByTestId("data-card")).toHaveLength(2);
    expect(screen.getByText("btc")).toBeInTheDocument();
    expect(screen.getByText("eth")).toBeInTheDocument();
  });
});
