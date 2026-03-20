import { useEffect, useState } from "react";

const INTERVAL_UNITS = [
  { value: "ms", text: "ms", factor: 1 },
  { value: "s", text: "sec", factor: 1_000 },
  { value: "m", text: "min", factor: 60_000 },
  { value: "h", text: "h", factor: 3_600_000 },
  { value: "d", text: "d", factor: 86_400_000 },
];

const intervalToMilliseconds = (value, unit) => {
  const selectedUnit = INTERVAL_UNITS.find((option) => option.value === unit);
  const numericValue = Number.parseInt(String(value), 10);
  if (!selectedUnit || Number.isNaN(numericValue) || numericValue <= 0) {
    return null;
  }
  return numericValue * selectedUnit.factor;
};

const intervalDecompose = (intervalInMilliseconds) => {
  const normalizedInterval = Number.parseInt(String(intervalInMilliseconds), 10);
  if (Number.isNaN(normalizedInterval) || normalizedInterval <= 0) {
    return { value: "1", unit: "s" };
  }
  for (const unit of ["d", "h", "m", "s"]) {
    const selectedUnit = INTERVAL_UNITS.find((option) => option.value === unit);
    if (selectedUnit && normalizedInterval % selectedUnit.factor === 0) {
      return { value: String(normalizedInterval / selectedUnit.factor), unit };
    }
  }
  return { value: String(normalizedInterval), unit: "ms" };
};

const IntervalPicker = ({ intervalInMilliseconds, disabled, setter }) => {
  const defaultIntervalParts = intervalDecompose(intervalInMilliseconds);
  const [intervalValue, setIntervalValue] = useState(defaultIntervalParts.value);
  const [intervalUnit, setIntervalUnit] = useState(defaultIntervalParts.unit);

  useEffect(() => {
    if (intervalInMilliseconds == null) {
      return;
    }
    const intervalParts = intervalDecompose(intervalInMilliseconds);
    setIntervalValue(intervalParts.value);
    setIntervalUnit(intervalParts.unit);
  }, [intervalInMilliseconds]);

  const intervalValueChanged = (event) => {
    const value = event.target.value;
    if ("" !== value && !/^\d+$/.test(value)) {
      return;
    }
    setIntervalValue(value);
    setter(intervalToMilliseconds(value, intervalUnit));
  };

  const intervalUnitChanged = (event) => {
    const unit = event.target.value;
    setIntervalUnit(unit);
    setter(intervalToMilliseconds(intervalValue, unit));
  };

  return (
    <div className={`data-interval-picker${disabled ? " is-disabled" : ""}`}>
      <input
        type="text"
        className="data-interval-value"
        placeholder="interval"
        value={intervalValue}
        onChange={intervalValueChanged}
        disabled={disabled}
      />
      <select className="data-interval-unit" value={intervalUnit} onChange={intervalUnitChanged} disabled={disabled}>
        {INTERVAL_UNITS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.text}
          </option>
        ))}
      </select>
    </div>
  );
};

export default IntervalPicker;