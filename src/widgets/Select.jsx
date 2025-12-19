import ReactSelect from 'react-select'

const Select = ({ options, value, disabled, setter }) => {
  return (
    <ReactSelect
      options={options}
      getOptionLabel={(option) => option.text}
      getOptionValue={(option) => option.value}
      value={options.find(o => o.value === value)}
      isDisabled={disabled}
      onChange={setter}
    />
  );
};

export default Select;
