const FormInput = ({ label, error, className = '', ...props }) => {
  return (
    <div className={className}>
      <label className="label" htmlFor={props.id || props.name}>
        {label}
      </label>
      <input
        className="input mt-1"
        id={props.id || props.name}
        {...props}
      />
      {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
};

export default FormInput;
