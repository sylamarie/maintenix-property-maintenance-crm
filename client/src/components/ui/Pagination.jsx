import { ChevronLeft, ChevronRight } from 'lucide-react';

const buttonClass =
  'inline-flex h-9 items-center gap-1 rounded-lg border border-ink-100 bg-white px-3 text-sm font-semibold text-ink-700 transition hover:border-ink-200 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-50';

// "Showing 11-20 of 47" with Previous / Next buttons.
// `pagination` is the { page, limit, total, totalPages } object from the API.
const Pagination = ({ pagination, itemLabel = 'items', isDisabled = false, onPageChange }) => {
  if (!pagination || pagination.total === 0) {
    return null;
  }

  const { page, limit, total, totalPages } = pagination;
  const first = (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col gap-3 border-t border-ink-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-ink-500" aria-live="polite">
        Showing {first}-{last} of {total} {itemLabel}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={buttonClass}
          disabled={isDisabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          Previous
        </button>
        <span className="px-2 text-sm font-medium text-ink-600">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          className={buttonClass}
          disabled={isDisabled || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
};

export default Pagination;
