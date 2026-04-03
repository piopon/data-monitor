import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import TimeSelect from "../../src/widgets/TimeSelect.jsx";

describe("TimeSelect", () => {
  test("decomposes milliseconds into a larger unit when divisible", () => {
    render(<TimeSelect milliseconds={120000} disabled={false} setter={() => {}} />);

    expect(screen.getByPlaceholderText("time")).toHaveValue("2");
    expect(screen.getByRole("combobox")).toHaveValue("m");
  });

  test("calls setter with converted milliseconds when value changes", async () => {
    const user = userEvent.setup();
    const setter = jest.fn();

    render(<TimeSelect milliseconds={null} disabled={false} setter={setter} />);

    const input = screen.getByPlaceholderText("time");
    await user.type(input, "15");

    expect(setter).toHaveBeenLastCalledWith(15);
  });

  test("calls setter with converted milliseconds when unit changes", async () => {
    const user = userEvent.setup();
    const setter = jest.fn();

    render(<TimeSelect milliseconds={1000} disabled={false} setter={setter} />);

    await user.selectOptions(screen.getByRole("combobox"), "m");

    expect(setter).toHaveBeenLastCalledWith(60000);
  });

  test("rejects non-numeric input and keeps previous value", async () => {
    const user = userEvent.setup();
    const setter = jest.fn();

    render(<TimeSelect milliseconds={1000} disabled={false} setter={setter} />);

    const input = screen.getByPlaceholderText("time");
    await user.clear(input);
    await user.type(input, "abc");

    expect(input).toHaveValue("");
    expect(setter).toHaveBeenLastCalledWith(null);
  });

  test("disabled mode disables both controls", () => {
    render(<TimeSelect milliseconds={5000} disabled={true} setter={() => {}} />);

    expect(screen.getByPlaceholderText("time")).toBeDisabled();
    expect(screen.getByRole("combobox")).toBeDisabled();
  });
});
