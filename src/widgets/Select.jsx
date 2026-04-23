import ReactSelect from "react-select";

const Select = ({ size = "small", options, placeholder="select...", value, disabled, setter }) => {
  return (
    <ReactSelect
      className={`select-${size}`}
      classNamePrefix="react-select"
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
