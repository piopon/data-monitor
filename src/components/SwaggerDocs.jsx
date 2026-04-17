"use client";

import { useContext, useEffect, useRef } from "react";
import SwaggerUIBundle from "swagger-ui-dist/swagger-ui-es-bundle";
import SwaggerUIStandalonePreset from "swagger-ui-dist/swagger-ui-standalone-preset";
import { LoginContext, PageContext } from "@/context/Contexts";

function initializeSwaggerUi(token, userId) {
  if ("undefined" === typeof window) return;
  const rootElement = window.document.getElementById("swagger-ui");
  if (rootElement == null) return;

  return SwaggerUIBundle({
    url: `/api/docs/openapi.json?user=${encodeURIComponent(String(userId ?? ""))}`,
    dom_id: "#swagger-ui",
    deepLinking: true,
    docExpansion: "list",
    displayRequestDuration: true,
    filter: true,
    supportedSubmitMethods: [],
    requestInterceptor: (req) => {
      if (token) {
        req.headers = {
          ...(req.headers || {}),
          Authorization: `Bearer ${token}`,
        };
      }
      return req;
    },
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    layout: "BaseLayout",
  });
}

export default function SwaggerDocs() {
  const swaggerUiRef = useRef(null);
  const { setPageId } = useContext(PageContext);
  const { token, userId } = useContext(LoginContext);
  const resolvedUserId = typeof userId === "function" ? userId() : null;

  useEffect(() => {
    setPageId("docs");
  }, [setPageId]);

  useEffect(() => {
    swaggerUiRef.current = initializeSwaggerUi(token, resolvedUserId);

    return () => {
      if (typeof swaggerUiRef.current?.destroy === "function") {
        swaggerUiRef.current.destroy();
      }
      swaggerUiRef.current = null;
    };
  }, [token, resolvedUserId]);

  return <div id="swagger-ui" />;
}
