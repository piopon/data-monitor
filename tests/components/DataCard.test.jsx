import { render, screen } from "@testing-library/react";

import DataCard from "../../src/components/DataCard.jsx";

jest.mock("@/components/DataItem", () => ({
  __esModule: true,
  default: ({ item }) => <div data-testid="data-item">{item.name}</div>,
}));

describe("DataCard", () => {
  test("renders title and child data items", () => {
    render(
      <DataCard
        data={{
          category: "crypto",
          name: "btc",
          items: [{ name: "binance" }, { name: "kraken" }],
        }}
      />,
    );

    expect(screen.getByText("crypto btc")).toBeInTheDocument();
    expect(screen.getAllByTestId("data-item")).toHaveLength(2);
    expect(screen.getByText("binance")).toBeInTheDocument();
    expect(screen.getByText("kraken")).toBeInTheDocument();
  });
});
