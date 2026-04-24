import { render, screen } from "@testing-library/react";

import EmptyCards from "../../src/components/EmptyCards.jsx";

describe("EmptyCards", () => {
  test("renders title and footer by default", () => {
    render(<EmptyCards whatToAdd="monitor" />);

    expect(screen.getByText("ah, fresh start, clean vibes...")).toBeInTheDocument();
    expect(screen.getByText(/add your first monitor/)).toBeInTheDocument();
    expect(screen.getByText(/scraper button will show you the way/)).toBeInTheDocument();
  });

  test("supports hiding title and footer", () => {
    render(<EmptyCards whatToAdd="notifier" showTitle={false} showFooter={false} />);

    expect(screen.queryByText("ah, fresh start, clean vibes...")).not.toBeInTheDocument();
    expect(screen.queryByText(/scraper button will show you the way/)).not.toBeInTheDocument();
    expect(screen.getByText(/add your first notifier/)).toBeInTheDocument();
  });
});
