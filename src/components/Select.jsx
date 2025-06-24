const Select = ({ options, value, setter }) => {
  return (
    <select
      value={value}
      onChange={(event) => setter(event.target.value)}
    >
      {options.map((option) => (
        <option value={option.value}>{option.text}</option>
      ))}
    </select>
  );
};

export default Select;
