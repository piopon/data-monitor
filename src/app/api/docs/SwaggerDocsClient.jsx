"use client";

import { useEffect } from "react";
import Script from "next/script";

function initializeSwaggerUi() {
  if ("undefined" === typeof window) {
    return;
  }
  if ("function" !== typeof window.SwaggerUIBundle) {
    return;
  }
  if ("undefined" === typeof window.SwaggerUIStandalonePreset) {
    return;
  }
  const rootElement = window.document.getElementById("swagger-ui");
  if (rootElement == null) {
    return;
  }

  window.SwaggerUIBundle({
    url: "/api/docs/openapi.json",
    dom_id: "#swagger-ui",
    deepLinking: true,
    docExpansion: "list",
    displayRequestDuration: true,
    filter: true,
    supportedSubmitMethods: [],
    presets: [window.SwaggerUIBundle.presets.apis, window.SwaggerUIStandalonePreset],
    layout: "BaseLayout",
  });
}

export default function SwaggerDocsClient() {
  useEffect(() => {
    initializeSwaggerUi();
  }, []);

  return (
    <>
      <link rel="stylesheet" href="/api/docs/swagger-ui.css" />
      <Script
        src="/api/docs/swagger-ui-bundle.js"
        strategy="afterInteractive"
        onLoad={initializeSwaggerUi}
      />
      <Script
        src="/api/docs/swagger-ui-standalone-preset.js"
        strategy="afterInteractive"
        onLoad={initializeSwaggerUi}
      />
      <div id="swagger-ui" />
    </>
  );
}
