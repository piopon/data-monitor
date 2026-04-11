import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import ScrollHintContainer from "../../src/components/ScrollHintContainer.jsx";

describe("ScrollHintContainer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders hint when content overflows and hides hint near bottom", async () => {
    render(
      <ScrollHintContainer className="api-docs-page" hintText="More content below, scroll down" hideScrollbar>
        <div style={{ height: "400px" }}>Content</div>
      </ScrollHintContainer>
    );

    const container = document.querySelector(".scroll-hint-container");
    let scrollTop = 0;

    Object.defineProperty(container, "clientHeight", {
      configurable: true,
      get: () => 100,
    });
    Object.defineProperty(container, "scrollHeight", {
      configurable: true,
      get: () => 320,
    });
    Object.defineProperty(container, "scrollTop", {
      configurable: true,
      get: () => scrollTop,
      set: (value) => {
        scrollTop = value;
      },
    });

    fireEvent(window, new Event("resize"));

    expect(await screen.findByText("More content below, scroll down")).toBeInTheDocument();

    scrollTop = 260;
    fireEvent.scroll(container);

    await waitFor(() => {
      expect(screen.queryByText("More content below, scroll down")).not.toBeInTheDocument();
    });
  });

  test("applies hide-scrollbar modifier only when requested", () => {
    const { rerender } = render(
      <ScrollHintContainer hideScrollbar className="custom-wrap">
        <div>Child</div>
      </ScrollHintContainer>
    );

    let container = document.querySelector(".scroll-hint-container");
    expect(container.className).toContain("scroll-hint-container--hide-scrollbar");
    expect(container.className).toContain("custom-wrap");

    rerender(
      <ScrollHintContainer hideScrollbar={false} className="custom-wrap">
        <div>Child</div>
      </ScrollHintContainer>
    );

    container = document.querySelector(".scroll-hint-container");
    expect(container.className).not.toContain("scroll-hint-container--hide-scrollbar");
  });

  test("renders custom root element when `as` is provided", () => {
    render(
      <ScrollHintContainer as="div" className="custom-wrap">
        <div>Child</div>
      </ScrollHintContainer>
    );

    const root = document.querySelector("div.scroll-hint-container.custom-wrap");
    expect(root).toBeInTheDocument();
  });
});
