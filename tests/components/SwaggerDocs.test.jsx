import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("swagger-ui-dist/swagger-ui-es-bundle", () => ({
  __esModule: true,
  default: Object.assign(jest.fn(() => ({ destroy: jest.fn() })), {
    presets: { apis: {} },
  }),
}));

jest.mock("swagger-ui-dist/swagger-ui-standalone-preset", () => ({
  __esModule: true,
  default: {},
}));

import SwaggerUIBundle from "swagger-ui-dist/swagger-ui-es-bundle";
import SwaggerDocs from "../../src/components/SwaggerDocs.jsx";

describe("SwaggerDocs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("initializes Swagger UI and disposes instance on unmount", () => {
    const { unmount } = render(
      <section className="api-docs-page">
        <SwaggerDocs />
      </section>
    );

    expect(SwaggerUIBundle).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/api/docs/openapi.json",
        dom_id: "#swagger-ui",
        supportedSubmitMethods: [],
      })
    );

    const swaggerUiInstance = SwaggerUIBundle.mock.results[0].value;

    unmount();

    expect(swaggerUiInstance.destroy).toHaveBeenCalled();
  });

  test("shows and hides floating scroll hint based on remaining scroll", async () => {
    render(
      <section className="api-docs-page">
        <SwaggerDocs />
      </section>
    );

    const container = document.querySelector("section.api-docs-page");
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
});
