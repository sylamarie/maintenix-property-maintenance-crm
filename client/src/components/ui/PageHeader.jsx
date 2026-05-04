const PageHeader = ({ eyebrow, title, description, action }) => {
  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        {eyebrow ? (
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 text-2xl font-semibold tracking-normal text-ink-900">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm text-ink-500">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
};

export default PageHeader;
