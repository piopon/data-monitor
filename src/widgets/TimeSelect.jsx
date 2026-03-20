import { useEffect, useState } from "react";

const TIME_UNITS = [
  { value: "ms", text: "ms", factor: 1 },
  { value: "s", text: "sec", factor: 1_000 },
  { value: "m", text: "min", factor: 60_000 },
  { value: "h", text: "h", factor: 3_600_000 },
  { value: "d", text: "d", factor: 86_400_000 },
];

const toMilliseconds = (rawValue, unitValue) => {
  const selectedUnit = TIME_UNITS.find((option) => option.value === unitValue);
  const numericValue = Number.parseInt(String(rawValue), 10);
  if (!selectedUnit || Number.isNaN(numericValue) || numericValue <= 0) {
    return null;
  }
  return numericValue * selectedUnit.factor;
};

const decomposeTime = (milliseconds) => {
  const normalizedTime = Number.parseInt(String(milliseconds), 10);
  if (Number.isNaN(normalizedTime)) {
    return { value: "", unit: "ms" };
  }
  if (normalizedTime <= 0) {
    return { value: "", unit: "ms" };
  }
  for (const unitValue of ["d", "h", "m", "s"]) {
    const selectedUnit = TIME_UNITS.find((option) => option.value === unitValue);
    if (selectedUnit && normalizedTime % selectedUnit.factor === 0) {
      return { value: String(normalizedTime / selectedUnit.factor), unit: unitValue };
    }
  }
  return { value: String(normalizedTime), unit: "ms" };
};

const TimeSelect = ({ milliseconds, disabled, setter }) => {
  const defaultParts = decomposeTime(milliseconds);
  const [timeValue, setTimeValue] = useState(defaultParts.value);
  const [unitValue, setUnitValue] = useState(defaultParts.unit);

  useEffect(() => {
    if (milliseconds == null) {
      return;
    }
    const timeParts = decomposeTime(milliseconds);
    setTimeValue(timeParts.value);
    setUnitValue(timeParts.unit);
  }, [milliseconds]);

  const timeValueChanged = (event) => {
    const value = event.target.value;
    if ("" !== value && !/^\d+$/.test(value)) {
      return;
    }
    setTimeValue(value);
    setter(toMilliseconds(value, unitValue));
  };

  const unitValueChanged = (event) => {
    const unit = event.target.value;
    setUnitValue(unit);
    setter(toMilliseconds(timeValue, unit));
  };

  return (
    <div className={`data-time-select${disabled ? " is-disabled" : ""}`}>
      <input
        type="text"
        className="data-time-value"
        placeholder="time"
        value={timeValue}
        onChange={timeValueChanged}
        disabled={disabled}
      />
      <select className="data-time-unit" value={unitValue} onChange={unitValueChanged} disabled={disabled}>
        {TIME_UNITS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.text}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TimeSelect;