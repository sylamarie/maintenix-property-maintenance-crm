import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../../api/adminApi.js', () => ({
  adminApi: {
    getClients: vi.fn(),
    getOperatives: vi.fn(),
    getJobsPage: vi.fn(),
    updateJobStatus: vi.fn(),
    assignJob: vi.fn(),
    deleteJob: vi.fn()
  }
}));

const { adminApi } = await import('../../../api/adminApi.js');
const { default: AdminJobsPage } = await import('../AdminJobsPage.jsx');

const makeJob = (overrides = {}) => ({
  id: 'job-1',
  title: 'Fix boiler',
  description: 'No hot water',
  status: 'pending',
  priority: 'high',
  dueDate: '2026-12-01',
  client: { id: 'c1', name: 'Northstar Housing' },
  property: { id: 'p1', name: 'Oak Court', addressLine1: '1 Oak Road', postcode: 'AB1 2CD' },
  assignedOperative: null,
  ...overrides
});

const onePage = (jobs, extra = {}) => ({
  jobs,
  pagination: { page: 1, limit: 10, total: jobs.length, totalPages: 1, ...extra }
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <AdminJobsPage />
    </MemoryRouter>
  );

let originalGetClientRects;

beforeEach(() => {
  vi.resetAllMocks();
  adminApi.getClients.mockResolvedValue([]);
  adminApi.getOperatives.mockResolvedValue([{ id: 'op-1', name: 'Amelia Clarke' }]);
  adminApi.getJobsPage.mockResolvedValue(onePage([makeJob()]));
  adminApi.updateJobStatus.mockResolvedValue({});

  // jsdom has no layout engine. Imitate a narrow window: the card list is
  // visible and the wide-screen table (inside a '.hidden' wrapper) is not, just
  // like the real page where CSS hides one of the two copies of each menu.
  originalGetClientRects = Element.prototype.getClientRects;
  Element.prototype.getClientRects = function getClientRects() {
    return this.closest('.hidden') ? [] : [{}];
  };
});

afterEach(() => {
  Element.prototype.getClientRects = originalGetClientRects;
});

describe('AdminJobsPage', () => {
  it('shows the jobs returned by the API with the total count', async () => {
    renderPage();

    expect((await screen.findAllByText('Fix boiler')).length).toBeGreaterThan(0);
    expect(screen.getByText('1 work order')).toBeInTheDocument();
  });

  it('keeps the list and the open menu on screen while a status change refreshes it', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText('Fix boiler');

    // The refresh after the change is slow, so we can look at the screen mid-way.
    let finishRefresh;
    adminApi.getJobsPage.mockImplementationOnce(
      () => new Promise((resolve) => (finishRefresh = resolve))
    );

    await user.click(screen.getAllByRole('button', { name: /open actions for fix boiler/i })[0]);
    const menu = screen.getAllByRole('group', { name: /actions for fix boiler/i })[0];
    await user.selectOptions(within(menu).getByLabelText(/status/i), 'completed');

    await waitFor(() => expect(adminApi.updateJobStatus).toHaveBeenCalledWith('job-1', 'completed'));

    // Mid-refresh: no "Loading records..." box, the row and the menu are still there.
    expect(screen.queryByText('Loading records...')).not.toBeInTheDocument();
    expect(screen.getAllByText('Fix boiler').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('group', { name: /actions for fix boiler/i }).length).toBeGreaterThan(0);

    finishRefresh(onePage([makeJob({ status: 'completed' })]));

    await waitFor(() => expect(screen.getAllByText('Completed').length).toBeGreaterThan(0));
    expect(screen.getAllByRole('group', { name: /actions for fix boiler/i }).length).toBeGreaterThan(0);
  });

  it('opens the delete dialog from the menu and deletes after confirming', async () => {
    const user = userEvent.setup();
    adminApi.deleteJob.mockResolvedValue();
    renderPage();
    await screen.findAllByText('Fix boiler');

    await user.click(screen.getAllByRole('button', { name: /open actions for fix boiler/i })[0]);
    const menu = screen.getAllByRole('group', { name: /actions for fix boiler/i })[0];
    await user.click(within(menu).getByRole('button', { name: /delete job/i }));

    const dialog = await screen.findByRole('alertdialog', { name: /delete job/i });
    await user.click(within(dialog).getByRole('button', { name: /delete job/i }));

    await waitFor(() => expect(adminApi.deleteJob).toHaveBeenCalledWith('job-1'));
  });

  it('waits for a pause in typing before searching (one request, not one per key)', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText('Fix boiler');
    adminApi.getJobsPage.mockClear();

    await user.type(screen.getByLabelText('Search jobs'), 'boiler');

    await waitFor(
      () =>
        expect(adminApi.getJobsPage).toHaveBeenCalledWith(
          expect.objectContaining({ search: 'boiler', page: 1 })
        ),
      { timeout: 2000 }
    );
    const searches = adminApi.getJobsPage.mock.calls.map(([params]) => params.search);
    expect(searches).not.toContain('b');
    expect(searches).not.toContain('boil');
  });

  it('shows the page position and asks for the next page', async () => {
    const user = userEvent.setup();
    adminApi.getJobsPage.mockResolvedValue(
      onePage([makeJob()], { total: 25, totalPages: 3 })
    );
    renderPage();

    expect(await screen.findByText('Showing 1-10 of 25 work orders')).toBeInTheDocument();
    adminApi.getJobsPage.mockClear();

    await user.click(screen.getByRole('button', { name: /next/i }));

    await waitFor(() =>
      expect(adminApi.getJobsPage).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, limit: 10 })
      )
    );
  });

  it('ignores a slow old response that arrives after a newer one', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findAllByText('Fix boiler');

    let finishOld;
    adminApi.getJobsPage
      .mockImplementationOnce(() => new Promise((resolve) => (finishOld = resolve)))
      .mockResolvedValueOnce(onePage([makeJob({ id: 'job-2', title: 'Newest result' })]));

    // Two quick filter changes: the first request is slow, the second is fast.
    await user.click(screen.getByRole('button', { name: 'Pending' }));
    await user.click(screen.getByRole('button', { name: 'Assigned' }));
    await screen.findAllByText('Newest result');

    finishOld(onePage([makeJob({ id: 'job-3', title: 'Stale result' })]));
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(screen.queryByText('Stale result')).not.toBeInTheDocument();
    expect(screen.getAllByText('Newest result').length).toBeGreaterThan(0);
  });
});
