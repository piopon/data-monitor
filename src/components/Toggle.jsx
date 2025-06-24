const Toggle = ({ id, enabled, setter }) => {
  const renderIcon = (children) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );

  return (
    <div className="toggle">
      <label htmlFor={`${id}-toggle`} className="toggle-root">
        <input
          type="checkbox"
          className="peer sr-only"
          id={`${id}-toggle`}
          name={`${id}-enabled`}
          checked={enabled}
          onChange={(event) => setter(event.target.checked)}
        />
        <span className="toggle-background"></span>
        <span className="toggle-button"></span>
        <span className="toggle-icon-left">{renderIcon(ICON_DISABLED)}</span>
        <span className="toggle-icon-right">{renderIcon(ICON_ENABLED)}</span>
      </label>
    </div>
  );
};

const ICON_DISABLED = (
  <>
    <path d="M18 6 L6 18"></path>
    <path d="m6 6 l12 12"></path>
  </>
);
const ICON_ENABLED = <polyline points="20 6 9 17 4 12" />;

export default Toggle;
