import { useContext } from "react";
import { fireEvent, render, screen } from "@testing-library/react";

import PageProvider from "../../src/context/PageProvider.jsx";
import { PageContext } from "../../src/context/Contexts.jsx";

function PageConsumer() {
  const { pageId, setPageId } = useContext(PageContext);

  return (
    <div>
      <span data-testid="page-id">{pageId}</span>
      <button onClick={() => setPageId("monitors")}>set-monitors</button>
    </div>
  );
}

describe("PageProvider", () => {
  test("exposes default pageId and updates it through context", () => {
    render(
      <PageProvider>
        <PageConsumer />
      </PageProvider>,
    );

    expect(screen.getByTestId("page-id")).toHaveTextContent("");

    fireEvent.click(screen.getByRole("button", { name: "set-monitors" }));

    expect(screen.getByTestId("page-id")).toHaveTextContent("monitors");
  });
});
