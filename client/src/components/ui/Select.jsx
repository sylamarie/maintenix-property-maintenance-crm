const Select = ({ label, error, children, className = '', ...props }) => {
  return (
    <div className={className}>
      <label className="label" htmlFor={props.id || props.name}>
        {label}
      </label>
      <select
        className="input mt-1"
        id={props.id || props.name}
        {...props}
      >
        {children}
      </select>
      {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
};

export default Select;
