import { useEffect, useId, useRef } from 'react';

const focusableSelector =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const ConfirmModal = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Delete',
  isWorking,
  onCancel,
  onConfirm
}) => {
  const dialogRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  // Keep the newest callback/flag in refs so the keyboard listener below does
  // not have to be re-attached on every render.
  const onCancelRef = useRef(onCancel);
  const isWorkingRef = useRef(isWorking);

  useEffect(() => {
    onCancelRef.current = onCancel;
    isWorkingRef.current = isWorking;
  }, [onCancel, isWorking]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    // Remember what had focus so we can give it back when the dialog closes.
    const previouslyFocused = document.activeElement;
    cancelButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (!isWorkingRef.current) {
          onCancelRef.current();
        }
        return;
      }

      // Keep Tab / Shift+Tab inside the dialog.
      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll(focusableSelector);

        if (focusable.length === 0) {
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 px-4"
      onMouseDown={(event) => {
        // A click on the dark background (not the dialog itself) cancels.
        if (event.target === event.currentTarget && !isWorking) {
          onCancel();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="w-full max-w-md rounded-lg bg-white p-5 shadow-soft"
      >
        <h2 id={titleId} className="text-lg font-semibold text-ink-900">
          {title}
        </h2>
        <p id={descriptionId} className="mt-2 text-sm text-ink-500">
          {description}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            disabled={isWorking}
            className="rounded-md border border-ink-100 px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isWorking}
            className="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-ink-300"
          >
            {isWorking ? 'Working...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
