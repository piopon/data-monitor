import { render } from "@testing-library/react";

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

});
