import clsx from 'clsx';

const priorityStyles = {
  low: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  medium: 'border-sky-200 bg-sky-50 text-sky-700',
  high: 'border-amber-200 bg-amber-50 text-amber-800',
  urgent: 'border-rose-200 bg-rose-50 text-rose-700'
};

const PriorityBadge = ({ priority }) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold capitalize',
        priorityStyles[priority] || priorityStyles.medium
      )}
    >
      {priority}
    </span>
  );
};

export default PriorityBadge;
