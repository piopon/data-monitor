import { render, screen } from "@testing-library/react";

import DataItem from "../../src/components/DataItem.jsx";

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt }) => (
    <div data-testid="next-image" data-src={typeof src === "string" ? src : "mock-img"} data-alt={alt}>
      {alt}
    </div>
  ),
}));

jest.mock("../../src/assets/images/unknown.png", () => "unknown.png");

jest.mock("../../src/components/DataMonitor", () => ({
  __esModule: true,
  default: ({ parentName }) => <div data-testid="monitor">monitor:{parentName}</div>,
}));

describe("DataItem", () => {
  test("renders valid item details and source icon", () => {
    render(
      <DataItem
        item={{
          name: "btc",
          status: "OK",
          icon: "btc.png",
          data: "123",
          extra: "USD",
        }}
      />,
    );

    expect(screen.getByText(/✔️/)).toBeInTheDocument();
    expect(screen.getByText("btc")).toBeInTheDocument();
    expect(screen.getByText(/123 USD/)).toBeInTheDocument();
    expect(screen.getByText("btc logo")).toBeInTheDocument();
    expect(screen.getByTestId("monitor")).toHaveTextContent("monitor:btc");
  });

  test("renders invalid item reason and fallback icon", () => {
    render(
      <DataItem
        item={{
          name: "btc",
          status: "ERR",
          icon: "btc.png",
          reason: "not found",
        }}
      />,
    );

    expect(screen.getByText(/❌/)).toBeInTheDocument();
    expect(screen.getByText("btc")).toBeInTheDocument();
    expect(screen.getByText(/not found/)).toBeInTheDocument();
    expect(screen.getByText("Unknown logo")).toBeInTheDocument();
  });
});
