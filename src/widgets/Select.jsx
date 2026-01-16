import ReactSelect from "react-select";

const Select = ({ size = "small", options, value, disabled, setter }) => {
  return (
    <ReactSelect
      className={`select-${size}`}
      classNamePrefix="react-select"
      options={options}
      getOptionLabel={(option) => option.text}
      getOptionValue={(option) => option.value}
      value={options.find((o) => o.text === value)}
      isDisabled={disabled}
      onChange={setter}
    />
  );
};

export default Select;
