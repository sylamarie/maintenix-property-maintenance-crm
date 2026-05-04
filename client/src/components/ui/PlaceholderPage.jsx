import { ArrowRight } from 'lucide-react';

const PlaceholderPage = ({ title, eyebrow, items = [] }) => {
  return (
    <div className="page-shell">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-normal text-ink-900">
          {title}
        </h1>
      </div>

      <div className="panel overflow-hidden">
        <div className="border-b border-ink-100 px-5 py-4">
          <h2 className="text-base font-semibold text-ink-900">Phase queue</h2>
        </div>
        <div className="divide-y divide-ink-100">
          {items.map((item) => (
            <div
              key={item}
              className="flex items-center justify-between gap-4 px-5 py-4 text-sm"
            >
              <span className="text-ink-700">{item}</span>
              <ArrowRight className="h-4 w-4 text-ink-400" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;
