import { LoginContext, PageContext } from "../../src/context/Contexts.jsx";

describe("Contexts", () => {
  test("exports LoginContext and PageContext", () => {
    expect(LoginContext).toBeDefined();
    expect(PageContext).toBeDefined();
    expect(LoginContext).not.toBe(PageContext);
  });

  test("provides React context provider objects", () => {
    expect(LoginContext.Provider).toBeDefined();
    expect(PageContext.Provider).toBeDefined();
  });
});
