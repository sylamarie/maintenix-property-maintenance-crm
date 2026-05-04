const EmptyState = ({ title, description, action }) => {
  return (
    <div className="panel p-8 text-center">
      <h2 className="text-base font-semibold text-ink-900">{title}</h2>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
};

export default EmptyState;
