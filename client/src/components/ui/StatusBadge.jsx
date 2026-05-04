import clsx from 'clsx';

const statusStyles = {
  pending: 'border-slate-200 bg-slate-50 text-slate-700',
  assigned: 'border-sky-200 bg-sky-50 text-sky-700',
  in_progress: 'border-amber-200 bg-amber-50 text-amber-800',
  on_hold: 'border-orange-200 bg-orange-50 text-orange-800',
  completed: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  cancelled: 'border-rose-200 bg-rose-50 text-rose-700',
  approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  rejected: 'border-rose-200 bg-rose-50 text-rose-700',
  pending_client_approval: 'border-violet-200 bg-violet-50 text-violet-700',
  pending_admin_review: 'border-amber-200 bg-amber-50 text-amber-800'
};

const normalise = (value) => String(value).toLowerCase().replaceAll(' ', '_');

const formatStatus = (value) => {
  return String(value)
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const StatusBadge = ({ status }) => {
  const key = normalise(status);

  return (
    <span
      className={clsx(
        'inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold',
        statusStyles[key] || 'border-ink-200 bg-ink-50 text-ink-700'
      )}
    >
      {formatStatus(status)}
    </span>
  );
};

export default StatusBadge;
