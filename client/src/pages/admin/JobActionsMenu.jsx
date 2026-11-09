import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FileText, MoreHorizontal } from 'lucide-react';

import { jobStatuses } from '../../utils/constants.js';

const JobActionsMenu = ({
  isOpen,
  job,
  onAssignmentChange,
  onDelete,
  onEdit,
  onToggle,
  onClose,
  onStatusChange,
  operativeOptions
}) => {
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // While open: Escape or a click anywhere outside closes the panel.
  //
  // The page renders TWO copies of this menu for every job (cards on small
  // screens, a table on wide screens) and CSS hides one of them. Both copies
  // share the same "open" state, so:
  //  - the hidden copy must ignore events (a click inside the visible menu
  //    looks like an "outside" click to it), and
  //  - closing must be "set to closed", not "toggle", so two copies can never
  //    cancel each other out.
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const isVisible = () =>
      Boolean(containerRef.current) && containerRef.current.getClientRects().length > 0;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isVisible()) {
        onCloseRef.current();
        triggerRef.current?.focus();
      }
    };
    const handleMouseDown = (event) => {
      if (isVisible() && !containerRef.current.contains(event.target)) {
        onCloseRef.current();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isOpen]);

  return (
  <div className="relative inline-flex" ref={containerRef}>
    <button
      ref={triggerRef}
      type="button"
      onClick={onToggle}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 transition hover:bg-ink-50 hover:text-ink-900"
      aria-label={`Open actions for ${job.title}`}
      aria-expanded={isOpen}
      aria-haspopup="true"
    >
      <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
    </button>
    {isOpen ? (
      <div
        className="absolute right-0 top-11 z-20 w-64 rounded-xl border border-ink-100 bg-white p-3 text-left shadow-soft"
        role="group"
        aria-label={`Actions for ${job.title}`}
      >
        <div className="grid gap-2">
          <Link
            to={`/reports/jobs/${job.id}`}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
            onClick={onToggle}
          >
            <FileText className="h-4 w-4" aria-hidden="true" />
            Report
          </Link>
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg px-3 py-2 text-left text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
          >
            Edit job
          </button>
          <label className="grid gap-1 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
            Status
            <select
              className="h-9 rounded-lg border border-ink-100 bg-white px-2 text-sm font-medium normal-case tracking-normal text-ink-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              value={job.status}
              onChange={(event) => onStatusChange(job, event.target.value)}
            >
              {jobStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
            Assignee
            <select
              className="h-9 rounded-lg border border-ink-100 bg-white px-2 text-sm font-medium normal-case tracking-normal text-ink-700 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              value={job.assignedOperativeId || ''}
              onChange={(event) =>
                onAssignmentChange(job, event.target.value)
              }
            >
              <option value="">Unassigned</option>
              {operativeOptions.map((operative) => (
                <option key={operative.value} value={operative.value}>
                  {operative.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg px-3 py-2 text-left text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
          >
            Delete job
          </button>
        </div>
      </div>
    ) : null}
  </div>
  );
};

export default JobActionsMenu;
