import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus } from 'lucide-react';

import { adminApi } from '../../api/adminApi.js';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import PriorityBadge from '../../components/ui/PriorityBadge.jsx';
import SearchInput from '../../components/ui/SearchInput.jsx';
import Select from '../../components/ui/Select.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { formatDate } from '../../utils/formatters.js';
import { jobPriorities, jobStatuses } from '../../utils/constants.js';
import AdminJobForm from './AdminJobForm.jsx';

const AdminJobsPage = () => {
  const [jobs, setJobs] = useState([]);
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

  const loadJobs = async () => {
    setIsLoading(true);
    setError('');

    try {
      setJobs(await adminApi.getJobs(filters));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load jobs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLookups().catch(() => setError('Unable to load filters.'));
  }, []);

  useEffect(() => {
    loadJobs();
  }, [
    filters.search,
    filters.status,
    filters.priority,
    filters.clientId,
    filters.operativeId
  ]);

  const operativeOptions = useMemo(
    () => operatives.map((operative) => ({ value: operative.id, label: operative.name })),
    [operatives]
  );

  const setFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
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

  const columns = [
    {
      key: 'job',
      header: 'Job',
      render: (job) => (
        <div>
          <p className="font-semibold text-ink-900">{job.title}</p>
          <p className="mt-1 text-ink-500">
            {job.client.name} / {job.property.name}
          </p>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (job) => (
        <div className="grid gap-2">
          <StatusBadge status={job.status} />
          <Select
            label="Update status"
            name={`status-${job.id}`}
            value={job.status}
            onChange={(event) => handleStatusChange(job, event.target.value)}
          >
            {jobStatuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </Select>
        </div>
      )
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (job) => <PriorityBadge priority={job.priority} />
    },
    {
      key: 'operative',
      header: 'Operative',
      render: (job) => (
        <Select
          label="Assigned to"
          name={`operative-${job.id}`}
          value={job.assignedOperativeId || ''}
          onChange={(event) => handleAssignmentChange(job, event.target.value)}
        >
          <option value="">Unassigned</option>
          {operativeOptions.map((operative) => (
            <option key={operative.value} value={operative.value}>
              {operative.label}
            </option>
          ))}
        </Select>
      )
    },
    {
      key: 'dates',
      header: 'Dates',
      render: (job) => (
        <div className="text-ink-700">
          <p>Scheduled: {formatDate(job.scheduledDate)}</p>
          <p className="mt-1 text-ink-500">Due: {formatDate(job.dueDate)}</p>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (job) => (
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/reports/jobs/${job.id}`}
            className="inline-flex items-center gap-1.5 rounded-md border border-ink-100 px-3 py-1.5 font-semibold text-ink-700 hover:bg-ink-50"
          >
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            Report
          </Link>
          <button
            type="button"
            onClick={() => setEditingJob(job)}
            className="rounded-md border border-ink-100 px-3 py-1.5 font-semibold text-ink-700 hover:bg-ink-50"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(job)}
            className="rounded-md border border-rose-200 px-3 py-1.5 font-semibold text-rose-700 hover:bg-rose-50"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Work orders"
        title="Jobs"
        description="Create, assign, filter, and update property maintenance work orders."
        action={
          <Link
            to="/admin/jobs/new"
            className="inline-flex items-center gap-2 rounded-md bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-900"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New job
          </Link>
        }
      />

      <div className="grid gap-3 xl:grid-cols-[1fr_160px_160px_220px_220px]">
        <SearchInput
          value={filters.search}
          onChange={(value) => setFilter('search', value)}
          placeholder="Search jobs, clients, or properties"
        />
        <Select
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
        </Select>
        <Select
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
        </Select>
        <Select
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
        </Select>
        <Select
          label="Operative"
          name="operativeFilter"
          value={filters.operativeId}
          onChange={(event) => setFilter('operativeId', event.target.value)}
        >
          <option value="">All operatives</option>
          {operativeOptions.map((operative) => (
            <option key={operative.value} value={operative.value}>
              {operative.label}
            </option>
          ))}
        </Select>
      </div>

      {error ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

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

      <DataTable
        columns={columns}
        rows={jobs}
        getRowKey={(job) => job.id}
        isLoading={isLoading}
        emptyState={
          <EmptyState
            title="No jobs found"
            description="Create work orders and assign them to field operatives."
            action={
              <Link
                to="/admin/jobs/new"
                className="inline-flex rounded-md bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-900"
              >
                Create job
              </Link>
            }
          />
        }
      />

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
