import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  ListFilter,
  MapPin,
  Plus,
  Search,
  SlidersHorizontal,
  X
} from 'lucide-react';

import { adminApi } from '../../api/adminApi.js';
import ActionButton from '../../components/ui/ActionButton.jsx';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import PriorityBadge from '../../components/ui/PriorityBadge.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import { jobPriorities, jobStatuses } from '../../utils/constants.js';
import { formatDate } from '../../utils/formatters.js';
import AdminJobForm from './AdminJobForm.jsx';
import JobActionsMenu from './JobActionsMenu.jsx';

const getJobCode = (id) => `JOB-${String(id).padStart(4, '0')}`;

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'NA';

const getActiveFilterCount = (filters) =>
  Object.values(filters).filter(Boolean).length;

const statusTabs = [
  { value: '', label: 'All work orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'on_hold', label: 'On hold' },
  { value: 'completed', label: 'Completed' }
];

const ToolbarSelect = ({ label, name, value, onChange, children }) => (
  <label className="grid gap-1.5 text-xs font-semibold text-ink-500">
    <span>{label}</span>
    <select
      className="h-11 w-full rounded-xl border border-ink-100 bg-white px-4 text-sm font-medium text-ink-700 shadow-sm outline-none transition hover:border-ink-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
      name={name}
      value={value}
      onChange={onChange}
    >
      {children}
    </select>
  </label>
);

const PAGE_SIZE = 10;

const AdminJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  // Each request gets a number; only the newest one is allowed to update the
  // screen, so a slow older response can never overwrite a newer one.
  const latestRequestId = useRef(0);
  const [clients, setClients] = useState([]);
  const [operatives, setOperatives] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    clientId: '',
    operativeId: ''
  });
  const [editingJob, setEditingJob] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [openActionMenuId, setOpenActionMenuId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const loadLookups = async () => {
    const [clientsResult, operativesResult] = await Promise.all([
      adminApi.getClients(),
      adminApi.getOperatives()
    ]);
    setClients(clientsResult);
    setOperatives(operativesResult);
  };

  // Wait until the user pauses typing before searching.
  const debouncedSearch = useDebouncedValue(filters.search, 300);

  const loadJobs = async () => {
    const requestId = latestRequestId.current + 1;
    latestRequestId.current = requestId;
    setIsLoading(true);
    setError('');

    try {
      const result = await adminApi.getJobsPage({
        ...filters,
        search: debouncedSearch,
        page,
        limit: PAGE_SIZE
      });

      if (requestId !== latestRequestId.current) {
        return;
      }

      // The last job on the last page was removed: go back one page.
      if (result.jobs.length === 0 && page > 1 && result.pagination.totalPages < page) {
        setPage(result.pagination.totalPages);
        return;
      }

      setJobs(result.jobs);
      setPagination(result.pagination);
    } catch (requestError) {
      if (requestId === latestRequestId.current) {
        setError(requestError.response?.data?.message || 'Unable to load jobs.');
      }
    } finally {
      if (requestId === latestRequestId.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    loadLookups().catch(() => setError('Unable to load filters.'));
  }, []);

  useEffect(() => {
    loadJobs();
  }, [
    debouncedSearch,
    filters.status,
    filters.priority,
    filters.clientId,
    filters.operativeId,
    page
  ]);

  const operativeOptions = useMemo(
    () =>
      operatives.map((operative) => ({
        value: operative.id,
        label: operative.name
      })),
    [operatives]
  );

  const activeFilterCount = getActiveFilterCount(filters);

  const setFilter = (name, value) => {
    setPage(1);
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const resetFilters = () => {
    setPage(1);
    setFilters({
      search: '',
      status: '',
      priority: '',
      clientId: '',
      operativeId: ''
    });
  };

  const handleStatusChange = async (job, status) => {
    setError('');
    try {
      await adminApi.updateJobStatus(job.id, status);
      await loadJobs();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || 'Unable to update job status.'
      );
    }
  };

  const handleAssignmentChange = async (job, assignedOperativeId) => {
    setError('');
    try {
      await adminApi.assignJob(job.id, assignedOperativeId || null);
      await loadJobs();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || 'Unable to assign job.'
      );
    }
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    setError('');

    try {
      await adminApi.deleteJob(deleteTarget.id);
      setDeleteTarget(null);
      await loadJobs();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to delete job.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="page-shell">
      <section className="panel p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
                <ClipboardList className="h-6 w-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
                  Work order management
                </p>
                <h1 className="mt-1 text-2xl font-semibold text-ink-900">
                  Job queue
                </h1>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-ink-500">
              Search, filter, assign, update, and review maintenance work orders
              from one operational list.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {activeFilterCount ? (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-ink-100 bg-white px-4 text-sm font-semibold text-ink-700 shadow-sm transition hover:border-ink-200 hover:bg-ink-50"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                Reset filters
              </button>
            ) : null}
            <ActionButton
              as={Link}
              to="/admin/jobs/new"
              icon={Plus}
              className="whitespace-nowrap"
            >
              New Job
            </ActionButton>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {statusTabs.map((tab) => {
            const isActive = filters.status === tab.value;

            return (
              <button
                key={tab.value || 'all'}
                type="button"
                onClick={() => setFilter('status', tab.value)}
                className={`h-10 shrink-0 rounded-xl px-4 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'border border-ink-100 bg-white text-ink-600 hover:border-ink-200 hover:bg-ink-50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-[minmax(260px,1.45fr)_160px_160px_210px_210px_auto] 2xl:items-end">
          <label className="grid gap-1.5 text-xs font-semibold text-ink-500">
            <span>Search</span>
            <span className="relative block">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400"
                aria-hidden="true"
              />
              <input
                aria-label="Search jobs"
                className="h-11 w-full rounded-xl border border-ink-100 bg-white pl-11 pr-4 text-sm text-ink-900 shadow-sm outline-none transition placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                type="search"
                placeholder="Search jobs, clients, properties..."
                value={filters.search}
                onChange={(event) => setFilter('search', event.target.value)}
              />
            </span>
          </label>
          <ToolbarSelect
            label="Status"
            name="statusFilter"
            value={filters.status}
            onChange={(event) => setFilter('status', event.target.value)}
          >
            <option value="">All statuses</option>
            {jobStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </ToolbarSelect>
          <ToolbarSelect
            label="Priority"
            name="priorityFilter"
            value={filters.priority}
            onChange={(event) => setFilter('priority', event.target.value)}
          >
            <option value="">All priorities</option>
            {jobPriorities.map((priority) => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </ToolbarSelect>
          <ToolbarSelect
            label="Client"
            name="clientFilter"
            value={filters.clientId}
            onChange={(event) => setFilter('clientId', event.target.value)}
          >
            <option value="">All clients</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </ToolbarSelect>
          <ToolbarSelect
            label="Assignee"
            name="operativeFilter"
            value={filters.operativeId}
            onChange={(event) => setFilter('operativeId', event.target.value)}
          >
            <option value="">All assignees</option>
            {operativeOptions.map((operative) => (
              <option key={operative.value} value={operative.value}>
                {operative.label}
              </option>
            ))}
          </ToolbarSelect>
          <div className="flex h-11 items-center justify-center gap-2 rounded-xl border border-ink-100 bg-white px-4 text-sm font-semibold text-ink-700 shadow-sm">
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Filters
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-xs font-semibold text-white">
              {activeFilterCount}
            </span>
          </div>
        </div>
      </section>

      {error ? <div className="alert-error">{error}</div> : null}

      {editingJob ? (
        <AdminJobForm
          job={editingJob}
          onCancel={() => setEditingJob(null)}
          onSaved={async () => {
            setEditingJob(null);
            await loadJobs();
          }}
        />
      ) : null}

      {/* The "Loading" box only replaces the list when there is nothing to show
          yet. On later refreshes (changing a status, paging, searching) the
          current rows stay on screen, so open menus are not torn down. */}
      {isLoading && jobs.length === 0 ? (
        <div className="panel p-8 text-sm font-medium text-ink-500">
          Loading records...
        </div>
      ) : jobs.length ? (
        <section
          className={`panel transition-opacity ${isLoading ? 'opacity-60' : ''}`}
          aria-busy={isLoading}
        >
          <div className="flex flex-col gap-3 border-b border-ink-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <ListFilter className="h-5 w-5 text-brand-600" aria-hidden="true" />
                <h2 className="text-lg font-semibold text-ink-900">
                  Jobs list
                </h2>
              </div>
              <p className="mt-1 text-sm text-ink-500">
                {pagination?.total ?? jobs.length} work order
                {(pagination?.total ?? jobs.length) === 1 ? '' : 's'}
                {activeFilterCount ? ` with ${activeFilterCount} active filter${activeFilterCount === 1 ? '' : 's'}` : ''}
              </p>
            </div>
            <div className="inline-flex h-9 items-center rounded-full border border-ink-100 bg-ink-50 px-3 text-xs font-semibold text-ink-600">
              Row actions include report, edit, status, assignee, and delete
            </div>
          </div>

          <div className="grid gap-3 p-4 xl:hidden">
            {jobs.map((job) => {
              const isMenuOpen = openActionMenuId === job.id;
              const assigneeName =
                job.assignedOperative?.name || 'Unassigned';
              const propertyName = job.property?.name || 'No property';
              const propertyAddress =
                job.property?.addressLine1 || job.property?.postcode || '';
              const clientName = job.client?.name || 'No client';

              return (
                <article
                  key={job.id}
                  className="rounded-xl border border-ink-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-brand-600">
                        {getJobCode(job.id)}
                      </p>
                      <h3 className="mt-1 break-words text-base font-semibold text-ink-900">
                        {job.title}
                      </h3>
                    </div>
                    <JobActionsMenu
                      isOpen={isMenuOpen}
                      job={job}
                      operativeOptions={operativeOptions}
                      onAssignmentChange={handleAssignmentChange}
                      onStatusChange={handleStatusChange}
                      onToggle={() =>
                        setOpenActionMenuId((current) =>
                          current === job.id ? null : job.id
                        )
                      }
                      onClose={() => setOpenActionMenuId(null)}
                      onEdit={() => {
                        setEditingJob(job);
                        setOpenActionMenuId(null);
                      }}
                      onDelete={() => {
                        setDeleteTarget(job);
                        setOpenActionMenuId(null);
                      }}
                    />
                  </div>

                  {job.description ? (
                    <p className="mt-2 break-words text-sm leading-6 text-ink-500">
                      {job.description}
                    </p>
                  ) : null}

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-ink-50 px-3 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                        Property
                      </p>
                      <p className="mt-1 font-semibold text-ink-900">
                        {propertyName}
                      </p>
                      {propertyAddress ? (
                        <p className="mt-1 text-xs text-ink-500">
                          {propertyAddress}
                        </p>
                      ) : null}
                      <p className="mt-2 text-xs text-ink-500">
                        Client: {clientName}
                      </p>
                    </div>

                    <div className="rounded-xl bg-ink-50 px-3 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                        Assignment
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700 ring-1 ring-brand-100">
                          {getInitials(assigneeName)}
                        </span>
                        <span className="font-medium text-ink-800">
                          {assigneeName}
                        </span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <StatusBadge status={job.status} />
                        <PriorityBadge priority={job.priority} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-100 px-3 py-2 text-sm text-ink-600">
                    <span className="font-semibold text-ink-700">Due date</span>
                    <span>{formatDate(job.dueDate)}</span>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="hidden xl:block">
            <table className="w-full table-fixed text-sm">
              <colgroup>
                <col className="w-[22%]" />
                <col className="w-[20%]" />
                <col className="w-[12%]" />
                <col className="w-[13%]" />
                <col className="w-[10%]" />
                <col className="w-[9%]" />
                <col className="w-[9%]" />
                <col className="w-[5%]" />
              </colgroup>
              <thead className="border-b border-ink-100 bg-ink-50/80 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-3 py-3">Job</th>
                  <th className="px-3 py-3">Property</th>
                  <th className="px-3 py-3">Client</th>
                  <th className="px-3 py-3">Assignee</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Priority</th>
                  <th className="px-3 py-3">Due</th>
                  <th className="px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 bg-white">
                {jobs.map((job) => {
                  const isMenuOpen = openActionMenuId === job.id;
                  const assigneeName =
                    job.assignedOperative?.name || 'Unassigned';
                  const propertyName = job.property?.name || 'No property';
                  const propertyAddress =
                    job.property?.addressLine1 || job.property?.postcode || '';
                  const clientName = job.client?.name || 'No client';

                  return (
                    <tr key={job.id} className="transition hover:bg-ink-50/70">
                      <td className="px-3 py-3 align-top">
                        <p className="break-words font-semibold leading-5 text-ink-900">
                          {job.title}
                        </p>
                        {job.description ? (
                          <p className="mt-1 break-words text-xs leading-5 text-ink-500">
                            {job.description}
                          </p>
                        ) : null}
                        <p className="mt-1 text-xs font-semibold text-brand-600">
                          {getJobCode(job.id)}
                        </p>
                      </td>
                      <td className="px-3 py-3 align-top">
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
                          <div className="min-w-0">
                            <p className="break-words font-semibold text-ink-800">
                              {propertyName}
                            </p>
                            {propertyAddress ? (
                              <p className="mt-1 break-words text-xs text-ink-500">
                                {propertyAddress}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 align-top text-ink-700">
                        <p className="break-words font-medium">{clientName}</p>
                      </td>
                      <td className="px-3 py-3 align-top">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700 ring-1 ring-brand-100">
                            {getInitials(assigneeName)}
                          </span>
                          <span className="font-medium text-ink-800">
                            {assigneeName}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 align-top">
                        <StatusBadge status={job.status} />
                      </td>
                      <td className="px-3 py-3 align-top">
                        <PriorityBadge priority={job.priority} />
                      </td>
                      <td className="px-3 py-3 align-top text-sm font-medium text-ink-700">
                        {formatDate(job.dueDate)}
                      </td>
                      <td className="px-3 py-3 text-right align-top">
                        <JobActionsMenu
                          isOpen={isMenuOpen}
                          job={job}
                          operativeOptions={operativeOptions}
                          onAssignmentChange={handleAssignmentChange}
                          onStatusChange={handleStatusChange}
                          onToggle={() =>
                            setOpenActionMenuId((current) =>
                              current === job.id ? null : job.id
                            )
                          }
                          onClose={() => setOpenActionMenuId(null)}
                          onEdit={() => {
                            setEditingJob(job);
                            setOpenActionMenuId(null);
                          }}
                          onDelete={() => {
                            setDeleteTarget(job);
                            setOpenActionMenuId(null);
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            pagination={pagination}
            itemLabel="work orders"
            isDisabled={isLoading}
            onPageChange={setPage}
          />
        </section>
      ) : (
        <EmptyState
          title="No jobs found"
          description="Adjust filters or create a new work order for a client property."
          action={
            <ActionButton as={Link} to="/admin/jobs/new" icon={Plus}>
              Create job
            </ActionButton>
          }
        />
      )}

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete job"
        description={`Delete ${deleteTarget?.title}? This action removes the work order from the admin queue.`}
        confirmLabel="Delete job"
        isWorking={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default AdminJobsPage;
