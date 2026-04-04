import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Select from "../../src/widgets/Select.jsx";

describe("Select", () => {
  const options = [
    { value: "email", text: "Email" },
    { value: "discord", text: "Discord" },
  ];

  test("renders configured placeholder", () => {
    render(<Select options={options} placeholder="Choose notifier" setter={() => {}} />);

    expect(screen.getByText("Choose notifier")).toBeInTheDocument();
  });

  test("shows selected option based on value prop", () => {
    render(<Select options={options} value="discord" setter={() => {}} />);

    expect(screen.getByText("Discord")).toBeInTheDocument();
  });

  test("calls setter when user selects option", async () => {
    const user = userEvent.setup();
    const setter = jest.fn();

    render(<Select options={options} setter={setter} />);

    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByText("Discord"));

    expect(setter).toHaveBeenCalledTimes(1);
    expect(setter).toHaveBeenCalledWith(
      expect.objectContaining({ value: "discord", text: "Discord" }),
      expect.any(Object),
    );
  });
});
