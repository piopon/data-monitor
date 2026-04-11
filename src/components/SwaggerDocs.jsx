"use client";

import { useEffect, useRef, useState } from "react";
import SwaggerUIBundle from "swagger-ui-dist/swagger-ui-es-bundle";
import SwaggerUIStandalonePreset from "swagger-ui-dist/swagger-ui-standalone-preset";

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
  const [showScrollHint, setShowScrollHint] = useState(false);
  const swaggerUiRef = useRef(null);

  useEffect(() => {
    swaggerUiRef.current = initializeSwaggerUi();

    return () => {
      if (typeof swaggerUiRef.current?.destroy === "function") {
        swaggerUiRef.current.destroy();
      }
      swaggerUiRef.current = null;
    };
  }, []);

  useEffect(() => {
    const container = document.querySelector("section.api-docs-page");
    if (container == null) {
      return;
    }

    const updateHintVisibility = () => {
      const remaining = container.scrollHeight - container.clientHeight - container.scrollTop;
      setShowScrollHint(container.scrollHeight > container.clientHeight && remaining > 8);
    };

    updateHintVisibility();
    container.addEventListener("scroll", updateHintVisibility, { passive: true });
    window.addEventListener("resize", updateHintVisibility);
    const delayedCheck = window.setTimeout(updateHintVisibility, 250);

    return () => {
      container.removeEventListener("scroll", updateHintVisibility);
      window.removeEventListener("resize", updateHintVisibility);
      window.clearTimeout(delayedCheck);
    };
  }, []);

  return (
    <>
      <div id="swagger-ui" />
      {showScrollHint ? <div className="api-docs-scroll-hint">More content below, scroll down</div> : null}
    </>
  );
}
