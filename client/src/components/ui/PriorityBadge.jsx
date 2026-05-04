import clsx from 'clsx';

const priorityStyles = {
  low: 'bg-slate-100 text-slate-700',
  medium: 'bg-sky-100 text-sky-700',
  high: 'bg-amber-100 text-amber-800',
  urgent: 'bg-rose-100 text-rose-700'
};

const PriorityBadge = ({ priority }) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize',
        priorityStyles[priority] || priorityStyles.medium
      )}
    >
      {priority}
    </span>
  );
};

export default PriorityBadge;
