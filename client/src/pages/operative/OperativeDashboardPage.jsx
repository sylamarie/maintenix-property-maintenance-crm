import { Camera, CheckCircle2, Clock3, ClipboardList } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { operativeApi } from '../../api/operativeApi.js';
import EmptyState from '../../components/ui/EmptyState.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import PriorityBadge from '../../components/ui/PriorityBadge.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { formatDate } from '../../utils/formatters.js';

const metricConfig = [
  {
    key: 'assignedJobs',
    label: 'Assigned jobs',
    helper: 'Current workload',
    icon: ClipboardList,
    tone: 'brand'
  },
  {
    key: 'inProgressJobs',
    label: 'In progress',
    helper: 'Jobs currently active',
    icon: Clock3,
    tone: 'amber'
  },
  {
    key: 'completedJobs',
    label: 'Completed',
    helper: 'Assigned jobs completed',
    icon: CheckCircle2,
    tone: 'green'
  },
  {
    key: 'dueSoonJobs',
    label: 'Due soon',
    helper: 'Due within 7 days',
    icon: Camera,
    tone: 'rose'
  }
];

const OperativeDashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      setError('');

      try {
        setDashboard(await operativeApi.getDashboard());
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            'Unable to load operative dashboard.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const metrics = dashboard?.metrics || {};

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Operative dashboard"
        title="Assigned work"
        description="Your active jobs, due dates, notes, and photo-reporting workflow."
        action={
          <Link
            to="/operative/jobs"
            className="rounded-md bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-900"
          >
            View jobs
          </Link>
        }
      />

      {error ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricConfig.map((item) => (
          <StatCard
            key={item.key}
            label={item.label}
            value={isLoading ? '...' : String(metrics[item.key] ?? 0)}
            helper={item.helper}
            icon={item.icon}
            tone={item.tone}
          />
        ))}
      </section>

      <section className="panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
          <h2 className="text-base font-semibold text-ink-900">
            Recent assigned jobs
          </h2>
          <Link
            to="/operative/jobs"
            className="text-sm font-semibold text-brand-700 hover:text-brand-900"
          >
            View all
          </Link>
        </div>
        {isLoading ? (
          <div className="p-5 text-sm text-ink-500">Loading jobs...</div>
        ) : dashboard?.recentJobs?.length ? (
          <div className="divide-y divide-ink-100">
            {dashboard.recentJobs.map((job) => (
              <Link
                key={job.id}
                to={`/operative/jobs/${job.id}`}
                className="block px-5 py-4 transition hover:bg-ink-50"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge status={job.status} />
                      <PriorityBadge priority={job.priority} />
                    </div>
                    <h3 className="mt-3 font-semibold text-ink-900">
                      {job.title}
                    </h3>
                    <p className="mt-1 text-sm text-ink-500">
                      {job.client.name} / {job.property.name}
                    </p>
                  </div>
                  <div className="text-sm text-ink-500">
                    <p>Scheduled: {formatDate(job.scheduledDate)}</p>
                    <p>Due: {formatDate(job.dueDate)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No assigned jobs"
            description="Assigned work orders will appear here when admin dispatches them to you."
          />
        )}
      </section>
    </div>
  );
};

export default OperativeDashboardPage;
