"use client";

import SwaggerUI from "swagger-ui-react";

export default function SwaggerDocsClient() {
  return (
    <SwaggerUI
      url="/api/docs/openapi.json"
      deepLinking
      docExpansion="list"
      displayRequestDuration
      filter
      tryItOutEnabled={false}
      supportedSubmitMethods={[]}
    />
  );
}
