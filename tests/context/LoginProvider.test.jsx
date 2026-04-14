import { useContext } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import LoginProvider from "../../src/context/LoginProvider.jsx";
import { LoginContext } from "../../src/context/Contexts.jsx";

function LoginConsumer() {
  const ctx = useContext(LoginContext);

  return (
    <div>
      <span data-testid="auth-ready">{String(ctx.authReady)}</span>
      <span data-testid="user-logged">{String(ctx.userLogged)}</span>
      <span data-testid="token">{ctx.token ?? ""}</span>
      <span data-testid="challenge">{ctx.challenge ?? ""}</span>
      <span data-testid="email">{ctx.email ?? ""}</span>
      <span data-testid="is-demo">{String(ctx.isDemo)}</span>
      <span data-testid="user-id">{String(ctx.userId())}</span>

      <button
        onClick={() =>
          ctx.login(11, "user@example.com", {
            token: "jwt-11",
            challenge: "captcha-11",
          })
        }
      >
        do-login
      </button>
      <button
        onClick={() =>
          ctx.demo(21, "demo.user@data-monitor.local", {
            token: "demo-token",
            challenge: "demo-challenge",
          })
        }
      >
        do-demo
      </button>
      <button onClick={() => ctx.logout()}>do-logout</button>
    </div>
  );
}

describe("LoginProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("loads stored token and marks auth as ready on mount", async () => {
    localStorage.setItem("token", "stored-token");

    render(
      <LoginProvider>
        <LoginConsumer />
      </LoginProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("auth-ready")).toHaveTextContent("true");
      expect(screen.getByTestId("token")).toHaveTextContent("stored-token");
      expect(screen.getByTestId("user-logged")).toHaveTextContent("true");
    });
  });

  test("updates auth state and storage on login", async () => {
    render(
      <LoginProvider>
        <LoginConsumer />
      </LoginProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "do-login" }));

    await waitFor(() => {
      expect(screen.getByTestId("token")).toHaveTextContent("jwt-11");
      expect(screen.getByTestId("challenge")).toHaveTextContent("captcha-11");
      expect(screen.getByTestId("email")).toHaveTextContent("user@example.com");
      expect(screen.getByTestId("user-id")).toHaveTextContent("11");
      expect(screen.getByTestId("user-logged")).toHaveTextContent("true");
      expect(localStorage.getItem("id")).toBe("11");
      expect(localStorage.getItem("token")).toBe("jwt-11");
    });
  });

  test("uses demo login path and marks user as demo", async () => {
    render(
      <LoginProvider>
        <LoginConsumer />
      </LoginProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "do-demo" }));

    await waitFor(() => {
      expect(screen.getByTestId("is-demo")).toHaveTextContent("true");
      expect(screen.getByTestId("user-id")).toHaveTextContent("21");
      expect(screen.getByTestId("token")).toHaveTextContent("demo-token");
      expect(screen.getByTestId("email")).toHaveTextContent("demo.user@data-monitor.local");
    });
  });

  test("clears auth state and storage on logout", async () => {
    render(
      <LoginProvider>
        <LoginConsumer />
      </LoginProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "do-login" }));

    await waitFor(() => {
      expect(screen.getByTestId("token")).toHaveTextContent("jwt-11");
    });

    fireEvent.click(screen.getByRole("button", { name: "do-logout" }));

    await waitFor(() => {
      expect(screen.getByTestId("token")).toHaveTextContent("");
      expect(screen.getByTestId("challenge")).toHaveTextContent("");
      expect(screen.getByTestId("email")).toHaveTextContent("");
      expect(screen.getByTestId("user-id")).toHaveTextContent("null");
      expect(screen.getByTestId("user-logged")).toHaveTextContent("false");
      expect(screen.getByTestId("is-demo")).toHaveTextContent("false");
      expect(localStorage.getItem("id")).toBeNull();
      expect(localStorage.getItem("token")).toBeNull();
    });
  });

  test("returns localStorage id when state id is not set", async () => {
    localStorage.setItem("id", "55");

    render(
      <LoginProvider>
        <LoginConsumer />
      </LoginProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("auth-ready")).toHaveTextContent("true");
    });

    expect(screen.getByTestId("user-id")).toHaveTextContent("55");
  });
});
