import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import NotifierCard from "../../src/components/NotifierCard.jsx";

const toastErrorMock = jest.fn();
const toastSuccessMock = jest.fn();

jest.mock("react-toastify", () => ({
  toast: {
    error: (...args) => toastErrorMock(...args),
    success: (...args) => toastSuccessMock(...args),
  },
}));

jest.mock("../../src/widgets/Select.jsx", () => ({
  __esModule: true,
  default: ({ options, value, setter }) => (
    <select aria-label="type" value={value} onChange={(e) => setter({ value: e.target.value })}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.text}
        </option>
      ))}
    </select>
  ),
}));

describe("NotifierCard", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn();
    toastErrorMock.mockReset();
    toastSuccessMock.mockReset();
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  const options = [
    { value: "email", text: "email" },
    { value: "discord", text: "discord" },
  ];

  test("saves new notifier and calls onChange", async () => {
    const onChange = jest.fn();

    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 5 }) });

    render(
      <NotifierCard
        data={{ type: "email", origin: "gmail", sender: "u@test.com", password: "p", user: 7, token: "jwt" }}
        options={options}
        onChange={onChange}
        onDelete={jest.fn()}
      />,
    );

    fireEvent.submit(screen.getByRole("button", { name: "save" }).closest("form"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/notifier",
        expect.objectContaining({ method: "POST" }),
      );
      expect(onChange).toHaveBeenCalled();
      expect(toastSuccessMock).toHaveBeenCalledWith("Saved email notifier!");
    });
  });

  test("updates existing notifier", async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 8 }) });

    render(
      <NotifierCard
        data={{ id: 8, type: "discord", origin: "webhook", sender: "bot", password: "", user: 7, token: "jwt" }}
        options={options}
        onChange={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    fireEvent.submit(screen.getByRole("button", { name: "save" }).closest("form"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/notifier?id=8&user=7"),
        expect.objectContaining({ method: "PUT" }),
      );
      expect(toastSuccessMock).toHaveBeenCalledWith("Updated discord notifier!");
    });
  });

  test("deletes existing notifier", async () => {
    const onDelete = jest.fn();
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true }) });

    render(
      <NotifierCard
        data={{ id: 9, type: "email", origin: "gmail", sender: "u@test.com", password: "p", user: 7, token: "jwt" }}
        options={options}
        onChange={jest.fn()}
        onDelete={onDelete}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "delete" }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/notifier?id=9&user=7"),
        expect.objectContaining({ method: "DELETE" }),
      );
      expect(onDelete).toHaveBeenCalledWith(9);
      expect(toastSuccessMock).toHaveBeenCalledWith("Deleted email notifier!");
    });
  });

  test("shows API error message when save fails", async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, text: async () => '{"message":"save failed"}' });

    render(
      <NotifierCard
        data={{ type: "email", origin: "gmail", sender: "u@test.com", password: "p", user: 7, token: "jwt" }}
        options={options}
        onChange={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    fireEvent.submit(screen.getByRole("button", { name: "save" }).closest("form"));

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("save failed");
    });
  });

  test("renders only type selector when notifier type is empty", () => {
    render(
      <NotifierCard
        data={{ type: "", origin: "", sender: "", password: "", user: 7, token: "jwt" }}
        options={options}
        onChange={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(screen.getByLabelText("type")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "save" })).not.toBeInTheDocument();
  });

  test("does not call delete API when notifier id is missing", async () => {
    render(
      <NotifierCard
        data={{ type: "email", origin: "gmail", sender: "u@test.com", password: "p", user: 7, token: "jwt" }}
        options={options}
        onChange={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(screen.queryByRole("button", { name: "delete" })).not.toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("shows API error message when delete fails", async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, text: async () => '{"message":"delete failed"}' });

    render(
      <NotifierCard
        data={{ id: 9, type: "email", origin: "gmail", sender: "u@test.com", password: "p", user: 7, token: "jwt" }}
        options={options}
        onChange={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "delete" }));

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("delete failed");
    });
  });

  test("shows error when save request throws", async () => {
    global.fetch.mockRejectedValueOnce(new Error("network down"));

    render(
      <NotifierCard
        data={{ type: "email", origin: "gmail", sender: "u@test.com", password: "p", user: 7, token: "jwt" }}
        options={options}
        onChange={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    fireEvent.submit(screen.getByRole("button", { name: "save" }).closest("form"));

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("Error: network down");
    });
  });

  test("shows error when delete request throws", async () => {
    global.fetch.mockRejectedValueOnce(new Error("network down"));

    render(
      <NotifierCard
        data={{ id: 9, type: "email", origin: "gmail", sender: "u@test.com", password: "p", user: 7, token: "jwt" }}
        options={options}
        onChange={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "delete" }));

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith("Error: network down");
    });
  });
});
