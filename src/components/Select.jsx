const Select = ({ options, value, disabled, setter }) => {
  return (
    <select value={value} disabled={disabled} onChange={(event) => setter(event.target.value)}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.text}</option>
      ))}
    </select>
  );
};

export default Select;
