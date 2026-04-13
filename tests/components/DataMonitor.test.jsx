import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import DataMonitor from "../../src/components/DataMonitor.jsx";
import { LoginContext } from "../../src/context/Contexts.jsx";

const replaceMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

const toastErrorMock = jest.fn();
const toastWarnMock = jest.fn();
const toastWarningMock = jest.fn();
const toastSuccessMock = jest.fn();

jest.mock("react-toastify", () => ({
  toast: {
    error: (...args) => toastErrorMock(...args),
    warn: (...args) => toastWarnMock(...args),
    warning: (...args) => toastWarningMock(...args),
    success: (...args) => toastSuccessMock(...args),
  },
}));

jest.mock("../../src/widgets/Toggle.jsx", () => ({
  __esModule: true,
  default: ({ label, enabled, setter }) => (
    <button type="button" onClick={() => setter(!enabled)}>
      {label}:{String(enabled)}
    </button>
  ),
}));

jest.mock("../../src/widgets/Select.jsx", () => ({
  __esModule: true,
  default: ({ options, value, placeholder = "", setter }) => {
    const id = placeholder || "select";
    return (
      <select aria-label={id} value={value} onChange={(e) => setter({ value: e.target.value })}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.text}
          </option>
        ))}
      </select>
    );
  },
}));

jest.mock("../../src/widgets/TimeSelect.jsx", () => ({
  __esModule: true,
  default: ({ milliseconds, setter }) => (
    <input aria-label="time" value={milliseconds} onChange={(e) => setter(Number(e.target.value))} />
  ),
}));

describe("DataMonitor", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
    replaceMock.mockReset();
    toastErrorMock.mockReset();
    toastWarnMock.mockReset();
    toastWarningMock.mockReset();
    toastSuccessMock.mockReset();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  function renderWithLogin(value) {
    return render(
      <LoginContext.Provider value={value}>
        <DataMonitor parentName="BTC/USD" />
      </LoginContext.Provider>,
    );
  }

  test("shows missing user id error in initializer", async () => {
    renderWithLogin({ isDemo: false, userId: () => "", email: "u@test.com", token: "jwt" });

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("Missing user ID, please re-login and try again.");
    });
  });

  test("loads monitor/notifier data and saves monitor", async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 2, type: "email" }] })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 21, enabled: true, condition: ">", threshold: "10", interval: 600000, notifier_id: 2 }],
      })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 2, type: "email" }] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 21 }) });

    renderWithLogin({ isDemo: false, userId: () => 7, email: "u@test.com", token: "jwt" });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    fireEvent.click(screen.getByRole("button", { name: "save" }));

    await waitFor(() => {
      expect(toastSuccessMock).toHaveBeenCalledWith("Updated BTC/USD monitor!");
      expect(global.fetch).toHaveBeenCalledTimes(4);
    });
  });

  test("redirects to notifiers when configure option is selected", async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    renderWithLogin({ isDemo: false, userId: () => 7, email: "u@test.com", token: "jwt" });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    fireEvent.change(screen.getByLabelText("notifier"), { target: { value: "config@-1" } });

    expect(replaceMock).toHaveBeenCalledWith("/notifiers");
  });

  test("shows warning when testing monitor without configured notifier type", async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    renderWithLogin({ isDemo: false, userId: () => 7, email: "u@test.com", token: "jwt" });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    fireEvent.click(screen.getByRole("button", { name: "enabled:false" }));

    fireEvent.click(screen.getByRole("button", { name: "test" }));

    await waitFor(() => {
      expect(toastWarningMock).toHaveBeenCalledWith("Please select a configured notifier before running test notification.");
    });
  });

  test("shows demo warning when saving in demo mode", async () => {
    global.fetch.mockResolvedValue({ ok: true, json: async () => [] });

    renderWithLogin({ isDemo: true, userId: () => 7, email: "u@test.com", token: "jwt" });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    fireEvent.click(screen.getByRole("button", { name: "save" }));

    expect(toastWarnMock).toHaveBeenCalledWith("Notifications are disabled for demo session.");
  });

  test("shows missing token error in initializer", async () => {
    renderWithLogin({ isDemo: false, userId: () => 7, email: "u@test.com", token: "" });

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("Missing user token, please re-login and try again.");
    });
  });

  test("shows notifier fetch API error in initializer", async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, json: async () => ({ message: "notifier load failed" }) });

    renderWithLogin({ isDemo: false, userId: () => 7, email: "u@test.com", token: "jwt" });

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("notifier load failed");
    });
  });

  test("shows monitor fetch API error in initializer", async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ message: "monitor load failed" }) });

    renderWithLogin({ isDemo: false, userId: () => 7, email: "u@test.com", token: "jwt" });

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("monitor load failed");
    });
  });

  test("shows multiple monitor entries error", async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 1 }, { id: 2 }] });

    renderWithLogin({ isDemo: false, userId: () => 7, email: "u@test.com", token: "jwt" });

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("Error: Received multiple monitor entries...");
    });
  });

  test("keeps monitor settings when monitor has no notifier configured", async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 21, enabled: true, condition: ">", threshold: "10", interval: 600000, notifier_id: null }],
      });

    renderWithLogin({ isDemo: false, userId: () => 7, email: "u@test.com", token: "jwt" });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(screen.getByRole("button", { name: "enabled:true" })).toBeInTheDocument();
      expect(screen.getByPlaceholderText("threshold")).toHaveValue("10");
      expect(screen.getByLabelText("select")).toHaveValue(">");
      expect(screen.getByLabelText("notifier")).toHaveValue("config@-1");
    });
  });

  test("shows multiple notifier entries error", async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 2, type: "email" }] })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 21, notifier_id: 2 }] })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 2, type: "email" }, { id: 3, type: "discord" }] });

    renderWithLogin({ isDemo: false, userId: () => 7, email: "u@test.com", token: "jwt" });

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("Error: Received multiple notifier entries...");
    });
  });

  test("shows missing user email error for email test notification", async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 2, type: "email" }] })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 21, enabled: true, notifier_id: 2 }] })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 2, type: "email" }] });

    renderWithLogin({ isDemo: false, userId: () => 7, email: null, token: "jwt" });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    fireEvent.click(screen.getByRole("button", { name: "test" }));

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("Missing user email to send notification. Please re-login and try again.");
    });
  });

  test("shows interval validation error when interval is invalid", async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    renderWithLogin({ isDemo: false, userId: () => 7, email: "u@test.com", token: "jwt" });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    fireEvent.click(screen.getByRole("button", { name: "enabled:false" }));
    fireEvent.change(screen.getByLabelText("time"), { target: { value: "0" } });
    fireEvent.click(screen.getByRole("button", { name: "save" }));

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("Interval must be a positive integer value.");
    });
  });

  test("shows save API error when monitor save returns non-ok", async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ message: "save failed" }) });

    renderWithLogin({ isDemo: false, userId: () => 7, email: "u@test.com", token: "jwt" });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    fireEvent.click(screen.getByRole("button", { name: "enabled:false" }));
    fireEvent.click(screen.getByRole("button", { name: "save" }));

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("save failed");
    });
  });

  test("shows missing user id error when saving monitor", async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    renderWithLogin({ isDemo: false, userId: () => "", email: "u@test.com", token: "jwt" });

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("Missing user ID, please re-login and try again.");
    });
  });

  test("shows missing token error when saving monitor", async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    renderWithLogin({ isDemo: false, userId: () => 7, email: "u@test.com", token: "" });

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("Missing user token, please re-login and try again.");
    });
  });

  test("shows test notification API error when notifier call returns non-ok", async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 2, type: "email" }] })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 21, enabled: true, notifier_id: 2 }] })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 2, type: "email" }] })
      .mockResolvedValueOnce({ ok: false, text: async () => '"send failed"' });

    renderWithLogin({ isDemo: false, userId: () => 7, email: "u@test.com", token: "jwt" });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    fireEvent.click(screen.getByRole("button", { name: "test" }));

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("Test notification ERROR: send failed");
    });
  });

  test("shows test notification success message when notifier call succeeds", async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 2, type: "email" }] })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 21, enabled: true, notifier_id: 2 }] })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 2, type: "email" }] })
      .mockResolvedValueOnce({ ok: true, text: async () => '"ok"' });

    renderWithLogin({ isDemo: false, userId: () => 7, email: "u@test.com", token: "jwt" });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    fireEvent.click(screen.getByRole("button", { name: "test" }));

    await waitFor(() => {
      expect(toastSuccessMock).toHaveBeenCalledWith("Test notification OK: ok");
    });
  });

  test("shows notifier-id warning for malformed notifier selection", async () => {
    global.fetch
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 2, type: "email" }] })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    renderWithLogin({ isDemo: false, userId: () => 7, email: "u@test.com", token: "jwt" });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    fireEvent.change(screen.getByLabelText("notifier"), { target: { value: "email@bad" } });

    await waitFor(() => {
      expect(toastWarningMock).toHaveBeenCalledWith(expect.stringMatching(/^Notifier does not have an ID:/));
    });
  });
});
