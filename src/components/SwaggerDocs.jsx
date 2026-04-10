"use client";

import { useEffect } from "react";
import SwaggerUIBundle from "swagger-ui-dist/swagger-ui-es-bundle";
import SwaggerUIStandalonePreset from "swagger-ui-dist/swagger-ui-standalone-preset";

function initializeSwaggerUi() {
  if ("undefined" === typeof window) return;
  const rootElement = window.document.getElementById("swagger-ui");
  if (rootElement == null) return;

  SwaggerUIBundle({
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
  useEffect(() => {
    initializeSwaggerUi();
  }, []);

  return <div id="swagger-ui" />;
}
