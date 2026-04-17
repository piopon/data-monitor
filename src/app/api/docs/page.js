import SwaggerDocs from "@/components/SwaggerDocs";
import ScrollHintContainer from "@/components/ScrollHintContainer";
import UserAccess from "@/components/UserAccess";

export const metadata = {
  title: "API docs | data-monitor",
  description: "OpenAPI 3.1 documentation for data-monitor API",
};

export default function ApiDocsPage() {
  return (
    <UserAccess>
      <ScrollHintContainer className="api-docs-page" hintText="More content below, scroll down" hideScrollbar>
        <SwaggerDocs />
      </ScrollHintContainer>
    </UserAccess>
  );
}
