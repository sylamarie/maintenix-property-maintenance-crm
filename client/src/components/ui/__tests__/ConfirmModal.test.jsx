import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import ConfirmModal from '../ConfirmModal.jsx';

const renderModal = (props = {}) => {
  const onCancel = vi.fn();
  const onConfirm = vi.fn();

  render(
    <ConfirmModal
      isOpen
      title="Delete job"
      description="Delete Fix boiler?"
      confirmLabel="Delete job"
      onCancel={onCancel}
      onConfirm={onConfirm}
      {...props}
    />
  );

  return { onCancel, onConfirm };
};

describe('ConfirmModal', () => {
  it('renders nothing when closed', () => {
    render(<ConfirmModal isOpen={false} title="Delete job" onCancel={() => {}} />);

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('is announced as a dialog with a title and description', () => {
    renderModal();

    const dialog = screen.getByRole('alertdialog', { name: 'Delete job' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleDescription('Delete Fix boiler?');
  });

  it('moves focus to the Cancel button when it opens', () => {
    renderModal();

    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
  });

  it('cancels on Escape', async () => {
    const user = userEvent.setup();
    const { onCancel } = renderModal();

    await user.keyboard('{Escape}');

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('ignores Escape and background clicks while a delete is running', async () => {
    const user = userEvent.setup();
    const { onCancel } = renderModal({ isWorking: true });

    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('alertdialog').parentElement);

    expect(onCancel).not.toHaveBeenCalled();
  });

  it('cancels when the dark background is clicked, but not when the dialog is', async () => {
    const user = userEvent.setup();
    const { onCancel } = renderModal();

    await user.click(screen.getByRole('alertdialog'));
    expect(onCancel).not.toHaveBeenCalled();

    await user.click(screen.getByRole('alertdialog').parentElement);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('confirms when the confirm button is clicked', async () => {
    const user = userEvent.setup();
    const { onConfirm } = renderModal();

    await user.click(screen.getByRole('button', { name: 'Delete job' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('keeps Tab and Shift+Tab inside the dialog', async () => {
    const user = userEvent.setup();
    renderModal();
    const cancel = screen.getByRole('button', { name: 'Cancel' });
    const confirm = screen.getByRole('button', { name: 'Delete job' });

    expect(cancel).toHaveFocus();
    await user.tab();
    expect(confirm).toHaveFocus();
    await user.tab(); // past the last button: wraps to the first
    expect(cancel).toHaveFocus();
    await user.tab({ shift: true }); // before the first button: wraps to the last
    expect(confirm).toHaveFocus();
  });

  it('gives focus back to the button that opened it', async () => {
    const user = userEvent.setup();

    const Harness = () => {
      const [open, setOpen] = useState(false);

      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open dialog
          </button>
          <ConfirmModal
            isOpen={open}
            title="Delete job"
            onCancel={() => setOpen(false)}
            onConfirm={() => {}}
          />
        </>
      );
    };

    render(<Harness />);
    const opener = screen.getByRole('button', { name: 'Open dialog' });

    await user.click(opener);
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });
});
