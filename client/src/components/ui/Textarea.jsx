const Textarea = ({ label, error, className = '', ...props }) => {
  return (
    <div className={className}>
      <label className="label" htmlFor={props.id || props.name}>
        {label}
      </label>
      <textarea
        className="input mt-1 min-h-24 resize-y"
        id={props.id || props.name}
        {...props}
      />
      {error ? <p className="mt-1 text-xs text-rose-600">{error}</p> : null}
    </div>
  );
};

export default Textarea;
