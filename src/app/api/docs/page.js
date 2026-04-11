import SwaggerDocs from "@/components/SwaggerDocs";

export const metadata = {
  title: "API docs | data-monitor",
  description: "OpenAPI 3.1 documentation for data-monitor API",
};

export default function ApiDocsPage() {
  return (
    <section className="api-docs-page">
      <SwaggerDocs />
    </section>
  );
}
