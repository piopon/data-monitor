import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Toggle from "../../src/widgets/Toggle.jsx";

describe("Toggle", () => {
  test("renders label and reflects enabled state", () => {
    render(<Toggle id="monitor" label="Enabled" enabled={true} setter={() => {}} />);

    expect(screen.getByText("Enabled")).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  test("calls setter with checkbox state on click", async () => {
    const user = userEvent.setup();
    const setter = jest.fn();

    render(<Toggle id="monitor" label="Enabled" enabled={false} setter={setter} />);

    await user.click(screen.getByRole("checkbox"));

    expect(setter).toHaveBeenCalledTimes(1);
    expect(setter).toHaveBeenCalledWith(true);
  });

  test("generates checkbox id from component id prop", () => {
    render(<Toggle id="alerts" label="Alerts" enabled={false} setter={() => {}} />);

    expect(screen.getByRole("checkbox")).toHaveAttribute("id", "alerts-toggle");
  });
});
