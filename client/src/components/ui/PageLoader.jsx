const PageLoader = ({ message = 'Loading Maintenix' }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4">
      <div className="panel flex items-center gap-3 px-5 py-4 text-sm font-medium text-ink-700">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-brand-700" />
        {message}
      </div>
    </div>
  );
};

export default PageLoader;
