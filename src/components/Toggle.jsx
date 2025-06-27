const Toggle = ({ id, label, enabled, setter }) => {
  const renderSvg = (children) => (
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
      <label className="toggle-root" htmlFor={`${id}-toggle`}>
        <input
          type="checkbox"
          className="peer sr-only"
          id={`${id}-toggle`}
          checked={enabled}
          onChange={(event) => setter(event.target.checked)}
        />
        <span className="toggle-background"></span>
        <span className="toggle-button"></span>
        <span className="toggle-icon-left">{renderSvg(ICON_DISABLED)}</span>
        <span className="toggle-icon-right">{renderSvg(ICON_ENABLED)}</span>
      </label>
      <span className="toggle-label">{label}</span>
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
