import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import { clientApi } from '../../api/clientApi.js';
import DataTable from '../../components/ui/DataTable.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import PriorityBadge from '../../components/ui/PriorityBadge.jsx';
import SearchInput from '../../components/ui/SearchInput.jsx';
import Select from '../../components/ui/Select.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { jobPriorities, jobStatuses } from '../../utils/constants.js';
import { formatDate } from '../../utils/formatters.js';

const ClientJobsPage = () => {
  const [searchParams] = useSearchParams();
  const propertySearch = searchParams.get('property') || '';
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({
    search: propertySearch,
    status: '',
    priority: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadJobs = async () => {
    setIsLoading(true);
    setError('');

    try {
      setJobs(await clientApi.getJobs(filters));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load jobs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [filters.search, filters.status, filters.priority]);

  useEffect(() => {
    setFilters((current) =>
      current.search === propertySearch
        ? current
        : { ...current, search: propertySearch }
    );
  }, [propertySearch]);

  const setFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const columns = [
    {
      key: 'job',
      header: 'Job',
      render: (job) => (
        <div>
          <Link
            to={`/client/jobs/${job.id}`}
            className="font-semibold text-brand-700 hover:text-brand-900"
          >
            {job.title}
          </Link>
          <p className="mt-1 text-ink-500">{job.property.name}</p>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (job) => <StatusBadge status={job.status} />
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (job) => <PriorityBadge priority={job.priority} />
    },
    {
      key: 'dates',
      header: 'Dates',
      render: (job) => (
        <div className="text-ink-700">
          <p>Scheduled: {formatDate(job.scheduledDate)}</p>
          <p className="mt-1 text-ink-500">Due: {formatDate(job.dueDate)}</p>
          {job.completionDate ? (
            <p className="mt-1 text-ink-500">
              Completed: {formatDate(job.completionDate)}
            </p>
          ) : null}
        </div>
      )
    },
    {
      key: 'activity',
      header: 'Activity',
      render: (job) => (
        <div className="text-ink-700">
          <p>{job.photoCount} photos</p>
          <p className="mt-1 text-ink-500">{job.variationCount} variations</p>
        </div>
      )
    }
  ];

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Client portal"
        title="Jobs"
        description="Read-only tracking for maintenance work orders across your properties."
      />

      <div className="grid gap-3 lg:grid-cols-[1fr_190px_190px]">
        <SearchInput
          value={filters.search}
          onChange={(value) => setFilter('search', value)}
          placeholder="Search jobs, property, or postcode"
        />
        <Select
          label="Status"
          name="clientJobStatusFilter"
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
          name="clientJobPriorityFilter"
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

      <DataTable
        columns={columns}
        rows={jobs}
        getRowKey={(job) => job.id}
        isLoading={isLoading}
        emptyState={
          <EmptyState
            title="No jobs found"
            description="Try adjusting your search or filters."
          />
        }
      />
    </div>
  );
};

export default ClientJobsPage;
