const Select = ({ options, value, disabled, setter }) => {
  return (
    <select value={value} disabled={disabled} onChange={(event) => setter(event.target)}>
      {options.map((option) => (
        <option key={option.key} value={option.value}>
          {option.text}
        </option>
      ))}
    </select>
  );
};

export default Select;
