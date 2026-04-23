import ReactSelect from "react-select";

const CONTROL_HEIGHT = 44;

const SELECT_STYLES = {
  control: (base) => ({
    ...base,
    minHeight: CONTROL_HEIGHT,
    height: CONTROL_HEIGHT,
  }),
  valueContainer: (base) => ({
    ...base,
    height: CONTROL_HEIGHT,
    padding: "0 6px",
  }),
  indicatorsContainer: (base) => ({
    ...base,
    height: CONTROL_HEIGHT,
  }),
  indicatorSeparator: () => ({
    display: "none",
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    padding: 0,
  }),
  singleValue: (base) => ({
    ...base,
    margin: 0,
  }),
  placeholder: (base) => ({
    ...base,
    margin: 0,
  }),
};

const Select = ({ size = "small", options, placeholder="select...", value, disabled, setter }) => {
  return (
    <ReactSelect
      className={`select-${size}`}
      classNamePrefix="react-select"
      styles={SELECT_STYLES}
      options={options}
      placeholder={placeholder}
      getOptionLabel={(option) => option.text}
      getOptionValue={(option) => option.value}
      value={options.find((o) => o.value === value || o.text === value)}
      isDisabled={disabled}
      onChange={setter}
    />
  );
};

export default Select;
