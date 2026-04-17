"use client";

import { useContext, useEffect, useRef } from "react";
import SwaggerUIBundle from "swagger-ui-dist/swagger-ui-es-bundle";
import SwaggerUIStandalonePreset from "swagger-ui-dist/swagger-ui-standalone-preset";
import { PageContext } from "@/context/Contexts";

function initializeSwaggerUi() {
  if ("undefined" === typeof window) return;
  const rootElement = window.document.getElementById("swagger-ui");
  if (rootElement == null) return;

  return SwaggerUIBundle({
    url: "/api/docs/openapi.json",
    dom_id: "#swagger-ui",
    deepLinking: true,
    docExpansion: "list",
    displayRequestDuration: true,
    filter: true,
    supportedSubmitMethods: [],
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    layout: "BaseLayout",
  });
}

export default function SwaggerDocs() {
  const swaggerUiRef = useRef(null);
  const { setPageId } = useContext(PageContext);

  useEffect(() => {
    setPageId("docs");
  }, [setPageId]);

  useEffect(() => {
    swaggerUiRef.current = initializeSwaggerUi();

    return () => {
      if (typeof swaggerUiRef.current?.destroy === "function") {
        swaggerUiRef.current.destroy();
      }
      swaggerUiRef.current = null;
    };
  }, []);

  return <div id="swagger-ui" />;
}
