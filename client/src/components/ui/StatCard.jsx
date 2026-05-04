const StatCard = ({ label, value, helper, icon: Icon, tone = 'brand' }) => {
  const tones = {
    brand: 'bg-brand-50 text-brand-700',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700'
  };

  return (
    <div className="panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ink-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-normal text-ink-900">
            {value}
          </p>
        </div>
        {Icon ? (
          <div className={`rounded-lg p-3 ${tones[tone]}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        ) : null}
      </div>
      {helper ? <p className="mt-4 text-sm text-ink-500">{helper}</p> : null}
    </div>
  );
};

export default StatCard;
