import SwaggerDocs from "@/components/SwaggerDocs";

export const metadata = {
  title: "API docs | data-monitor",
  description: "OpenAPI 3.1 documentation for data-monitor API",
};

export default function ApiDocsPage() {
  return (
    <section style={{ width: "100%", height: "100%", overflow: "auto", background: "#ffffff" }}>
      <SwaggerDocs />
    </section>
  );
}
