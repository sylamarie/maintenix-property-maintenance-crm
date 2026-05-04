import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { operativeApi } from '../../api/operativeApi.js';
import EmptyState from '../../components/ui/EmptyState.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import PriorityBadge from '../../components/ui/PriorityBadge.jsx';
import SearchInput from '../../components/ui/SearchInput.jsx';
import Select from '../../components/ui/Select.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { jobPriorities, jobStatuses } from '../../utils/constants.js';
import { formatDate } from '../../utils/formatters.js';

const OperativeJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadJobs = async () => {
    setIsLoading(true);
    setError('');

    try {
      setJobs(await operativeApi.getJobs(filters));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load jobs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [filters.search, filters.status, filters.priority]);

  const setFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
  };

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Field app"
        title="My jobs"
        description="Review assigned work orders, update progress, and upload job photos."
      />

      <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px]">
        <SearchInput
          value={filters.search}
          onChange={(value) => setFilter('search', value)}
          placeholder="Search title, client, property, or postcode"
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
      </div>

      {error ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="panel p-6 text-sm font-medium text-ink-500">
          Loading assigned jobs...
        </div>
      ) : jobs.length ? (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <Link
              key={job.id}
              to={`/operative/jobs/${job.id}`}
              className="panel block p-5 transition hover:border-brand-500"
            >
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={job.status} />
                    <PriorityBadge priority={job.priority} />
                  </div>
                  <h2 className="mt-3 text-lg font-semibold text-ink-900">
                    {job.title}
                  </h2>
                  <p className="mt-1 text-sm text-ink-500">
                    {job.client.name} / {job.property.name}
                  </p>
                  <p className="mt-1 text-sm text-ink-500">
                    {job.property.addressLine1}, {job.property.city},{' '}
                    {job.property.postcode}
                  </p>
                </div>
                <div className="grid gap-1 rounded-md bg-ink-50 px-4 py-3 text-sm text-ink-700">
                  <p>Scheduled: {formatDate(job.scheduledDate)}</p>
                  <p>Due: {formatDate(job.dueDate)}</p>
                  <p>
                    {job.noteCount} notes / {job.photoCount} photos
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No assigned jobs found"
          description="Adjust the filters or wait for admin to assign work to your account."
        />
      )}
    </div>
  );
};

export default OperativeJobsPage;
