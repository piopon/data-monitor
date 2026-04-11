import { render, screen } from "@testing-library/react";

import MonitorsPage from "../../src/views/MonitorsPage.jsx";

jest.mock("@/components/DataCards", () => ({
  __esModule: true,
  default: ({ data }) => <div data-testid="data-cards">cards:{data.length}</div>,
}));

jest.mock("@/components/EmptyCards", () => ({
  __esModule: true,
  default: ({ whatToAdd }) => <div data-testid="empty-cards">empty:{whatToAdd}</div>,
}));

jest.mock("@/widgets/Spinner", () => ({
  __esModule: true,
  default: () => <div data-testid="spinner">spinner</div>,
}));

describe("MonitorsPage", () => {
  test("shows spinner when loading", () => {
    const { container } = render(<MonitorsPage loading={true} data={[]} />);

    const root = container.querySelector("section#data-section.scroll-hint-container");
    expect(root).toBeInTheDocument();

    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  test("prioritizes spinner while loading even if data exists", () => {
    render(<MonitorsPage loading={true} data={[{ id: 1 }]} />);

    expect(screen.getByTestId("spinner")).toBeInTheDocument();
    expect(screen.queryByTestId("data-cards")).not.toBeInTheDocument();
  });

  test("shows DataCards when data is available", () => {
    render(<MonitorsPage loading={false} data={[{ id: 1 }, { id: 2 }]} />);

    expect(screen.getByTestId("data-cards")).toHaveTextContent("cards:2");
  });

  test("shows EmptyCards when no data is available", () => {
    render(<MonitorsPage loading={false} data={[]} />);

    expect(screen.getByTestId("empty-cards")).toHaveTextContent("empty:monitor");
  });
});
