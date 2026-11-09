import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import JobActionsMenu from '../JobActionsMenu.jsx';

const job = {
  id: 'job-1',
  title: 'Fix boiler',
  status: 'pending',
  assignedOperativeId: ''
};
const operativeOptions = [{ value: 'op-1', label: 'Amelia Clarke' }];

// The real page draws TWO copies of the menu per job (cards on small screens,
// a table on wide screens) and CSS hides one. Both share one "open" state.
// This harness copies that setup exactly. In jsdom there is no CSS, so we mark
// the hidden copy ourselves and teach getClientRects() about it.
const TwoCopiesHarness = ({ handlers }) => {
  const [openId, setOpenId] = useState(null);

  const menu = (
    <JobActionsMenu
      isOpen={openId === job.id}
      job={job}
      operativeOptions={operativeOptions}
      onToggle={() => setOpenId((current) => (current === job.id ? null : job.id))}
      onClose={() => setOpenId(null)}
      onEdit={() => {
        handlers.onEdit();
        setOpenId(null);
      }}
      onDelete={() => {
        handlers.onDelete();
        setOpenId(null);
      }}
      onStatusChange={handlers.onStatusChange}
      onAssignmentChange={handlers.onAssignmentChange}
    />
  );

  return (
    <MemoryRouter>
      <div data-testid="visible-copy">{menu}</div>
      <div data-testid="hidden-copy" data-hidden="true">
        {menu}
      </div>
      <button type="button">Somewhere else on the page</button>
    </MemoryRouter>
  );
};

const makeHandlers = () => ({
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onStatusChange: vi.fn(),
  onAssignmentChange: vi.fn()
});

const openVisibleMenu = async (user) => {
  const visible = within(screen.getByTestId('visible-copy'));
  await user.click(visible.getByRole('button', { name: /open actions for fix boiler/i }));
  return visible;
};

let originalGetClientRects;

beforeEach(() => {
  originalGetClientRects = Element.prototype.getClientRects;
  Element.prototype.getClientRects = function getClientRects() {
    return this.closest('[data-hidden="true"]') ? [] : [{}];
  };
});

afterEach(() => {
  Element.prototype.getClientRects = originalGetClientRects;
});

describe('JobActionsMenu (page renders two copies, one hidden)', () => {
  it('opens when the button is clicked', async () => {
    const user = userEvent.setup();
    render(<TwoCopiesHarness handlers={makeHandlers()} />);

    const visible = await openVisibleMenu(user);

    expect(visible.getByRole('group', { name: /actions for fix boiler/i })).toBeVisible();
  });

  it('clicking "Delete job" runs onDelete (regression: menu used to close first)', async () => {
    const user = userEvent.setup();
    const handlers = makeHandlers();
    render(<TwoCopiesHarness handlers={handlers} />);

    const visible = await openVisibleMenu(user);
    await user.click(visible.getByRole('button', { name: /delete job/i }));

    expect(handlers.onDelete).toHaveBeenCalledTimes(1);
  });

  it('clicking "Edit job" runs onEdit', async () => {
    const user = userEvent.setup();
    const handlers = makeHandlers();
    render(<TwoCopiesHarness handlers={handlers} />);

    const visible = await openVisibleMenu(user);
    await user.click(visible.getByRole('button', { name: /edit job/i }));

    expect(handlers.onEdit).toHaveBeenCalledTimes(1);
  });

  it('choosing a status or assignee reports the change and keeps the menu open', async () => {
    const user = userEvent.setup();
    const handlers = makeHandlers();
    render(<TwoCopiesHarness handlers={handlers} />);

    const visible = await openVisibleMenu(user);
    await user.selectOptions(visible.getByLabelText(/status/i), 'completed');
    await user.selectOptions(visible.getByLabelText(/assignee/i), 'op-1');

    expect(handlers.onStatusChange).toHaveBeenCalledWith(job, 'completed');
    expect(handlers.onAssignmentChange).toHaveBeenCalledWith(job, 'op-1');
    expect(visible.getByRole('group', { name: /actions for fix boiler/i })).toBeVisible();
  });

  it('closes on Escape and puts focus back on the button', async () => {
    const user = userEvent.setup();
    render(<TwoCopiesHarness handlers={makeHandlers()} />);

    const visible = await openVisibleMenu(user);
    await user.keyboard('{Escape}');

    expect(visible.queryByRole('group')).not.toBeInTheDocument();
    expect(
      visible.getByRole('button', { name: /open actions for fix boiler/i })
    ).toHaveFocus();
  });

  it('closes when you click somewhere else, and stays closed', async () => {
    const user = userEvent.setup();
    render(<TwoCopiesHarness handlers={makeHandlers()} />);

    const visible = await openVisibleMenu(user);
    await user.click(screen.getByRole('button', { name: /somewhere else/i }));

    expect(visible.queryByRole('group')).not.toBeInTheDocument();
  });
});
