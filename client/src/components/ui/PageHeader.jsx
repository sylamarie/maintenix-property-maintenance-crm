const PageHeader = ({ eyebrow, title, description, action }) => {
  return (
    <div className="panel relative overflow-hidden px-5 py-5 sm:px-6 md:px-7">
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-brand-50/70 to-transparent lg:block" />
      <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-2 text-2xl font-semibold tracking-normal text-ink-900 sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-500">
              {description}
            </p>
          ) : null}
        </div>
        {action ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2 md:justify-end">
            {action}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PageHeader;
