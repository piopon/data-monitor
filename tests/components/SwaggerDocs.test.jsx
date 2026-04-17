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
import { LoginContext, PageContext } from "../../src/context/Contexts.jsx";

describe("SwaggerDocs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("initializes Swagger UI and disposes instance on unmount", () => {
    const setPageId = jest.fn();
    const { unmount } = render(
      <LoginContext.Provider value={{ token: "abc-token", userId: () => 7 }}>
        <PageContext.Provider value={{ setPageId }}>
          <section className="api-docs-page">
            <SwaggerDocs />
          </section>
        </PageContext.Provider>
      </LoginContext.Provider>
    );

    expect(SwaggerUIBundle).toHaveBeenCalledWith(
      expect.objectContaining({
        url: "/api/docs/openapi.json?user=7",
        dom_id: "#swagger-ui",
        supportedSubmitMethods: [],
      })
    );

    expect(setPageId).toHaveBeenCalledWith("docs");

    const swaggerUiInstance = SwaggerUIBundle.mock.results[0].value;

    unmount();

    expect(swaggerUiInstance.destroy).toHaveBeenCalled();
  });

});
