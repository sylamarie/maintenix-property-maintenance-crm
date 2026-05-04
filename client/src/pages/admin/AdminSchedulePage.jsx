import { useEffect, useMemo, useState } from 'react';

import { adminApi } from '../../api/adminApi.js';
import EmptyState from '../../components/ui/EmptyState.jsx';
import FilterToolbar from '../../components/ui/FilterToolbar.jsx';
import FormInput from '../../components/ui/FormInput.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import PriorityBadge from '../../components/ui/PriorityBadge.jsx';
import Select from '../../components/ui/Select.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { jobStatuses } from '../../utils/constants.js';
import { formatDate } from '../../utils/formatters.js';

const AdminSchedulePage = () => {
  const [jobs, setJobs] = useState([]);
  const [operatives, setOperatives] = useState([]);
  const [filters, setFilters] = useState({
    scheduledDate: '',
    operativeId: '',
    status: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const operativeOptions = useMemo(
    () => operatives.map((operative) => ({ value: operative.id, label: operative.name })),
    [operatives]
  );

  const loadSchedule = async () => {
    setIsLoading(true);
    setError('');

    try {
      const [jobsResult, operativesResult] = await Promise.all([
        adminApi.getJobs(filters),
        adminApi.getOperatives()
      ]);
      setJobs(jobsResult);
      setOperatives(operativesResult);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || 'Unable to load schedule.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, [filters.scheduledDate, filters.operativeId, filters.status]);

  const setFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
  };

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Dispatch"
        title="Schedule"
        description="Review scheduled work by date, status, and assigned operative."
      />

      <FilterToolbar className="grid gap-4 md:grid-cols-3">
        <FormInput
          label="Scheduled date"
          name="scheduledDate"
          type="date"
          value={filters.scheduledDate}
          onChange={(event) => setFilter('scheduledDate', event.target.value)}
        />
        <Select
          label="Operative"
          name="operativeId"
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
        <Select
          label="Status"
          name="status"
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
      </FilterToolbar>

      {error ? (
        <div className="alert-error">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="panel p-6 text-sm font-medium text-ink-500">
          Loading schedule...
        </div>
      ) : jobs.length ? (
        <div className="grid gap-3">
          {jobs.map((job) => (
            <article key={job.id} className="panel p-5">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
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
                    Operative:{' '}
                    {job.assignedOperative?.name || 'Unassigned'}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No scheduled jobs found"
          description="Adjust the filters or create a job with a scheduled date."
        />
      )}
    </div>
  );
};

export default AdminSchedulePage;
