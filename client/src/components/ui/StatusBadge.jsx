import clsx from 'clsx';

const statusStyles = {
  pending: 'bg-slate-100 text-slate-700',
  assigned: 'bg-sky-100 text-sky-700',
  in_progress: 'bg-amber-100 text-amber-800',
  on_hold: 'bg-orange-100 text-orange-800',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-rose-100 text-rose-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700',
  pending_client_approval: 'bg-violet-100 text-violet-700',
  pending_admin_review: 'bg-amber-100 text-amber-800'
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
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
        statusStyles[key] || 'bg-ink-100 text-ink-700'
      )}
    >
      {formatStatus(status)}
    </span>
  );
};

export default StatusBadge;
