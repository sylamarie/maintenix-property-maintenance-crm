import {
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ClipboardList,
  Users
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { adminApi } from '../../api/adminApi.js';
import PageHeader from '../../components/ui/PageHeader.jsx';
import PriorityBadge from '../../components/ui/PriorityBadge.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { formatDate } from '../../utils/formatters.js';

const metricConfig = [
  {
    key: 'totalClients',
    label: 'Total clients',
    helper: 'Active CRM records',
    icon: Users,
    tone: 'brand'
  },
  {
    key: 'totalProperties',
    label: 'Properties',
    helper: 'Managed sites',
    icon: Building2,
    tone: 'green'
  },
  {
    key: 'activeJobs',
    label: 'Active jobs',
    helper: 'Open work orders',
    icon: ClipboardList,
    tone: 'amber'
  },
  {
    key: 'completedJobs',
    label: 'Completed jobs',
    helper: 'Closed work orders',
    icon: CheckCircle2,
    tone: 'green'
  },
  {
    key: 'pendingJobs',
    label: 'Pending jobs',
    helper: 'Awaiting assignment',
    icon: BriefcaseBusiness,
    tone: 'rose'
  }
];

const AdminDashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      setError('');

      try {
        setDashboard(await adminApi.getDashboard());
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            'Unable to load admin dashboard.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const metrics = dashboard?.metrics || {};
  const maxStatusCount = Math.max(
    ...(dashboard?.statusSummary || []).map((item) => item.count),
    1
  );

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Admin dashboard"
        title="Operations overview"
        description="Live CRM and work order metrics from the Maintenix database."
        action={
          <Link
            to="/admin/jobs/new"
            className="rounded-md bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-900"
          >
            New job
          </Link>
        }
      />

      {error ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
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

      <section className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
            <h2 className="text-base font-semibold text-ink-900">Recent jobs</h2>
            <Link
              to="/admin/jobs"
              className="text-sm font-semibold text-brand-700 hover:text-brand-900"
            >
              View all
            </Link>
          </div>
          {isLoading ? (
            <div className="p-5 text-sm text-ink-500">Loading jobs...</div>
          ) : dashboard?.recentJobs?.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-ink-100 text-sm">
                <thead className="bg-ink-50 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
                  <tr>
                    <th className="px-5 py-3">Job</th>
                    <th className="px-5 py-3">Client</th>
                    <th className="px-5 py-3">Priority</th>
                    <th className="px-5 py-3">Due</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100 bg-white">
                  {dashboard.recentJobs.map((job) => (
                    <tr key={job.id}>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-ink-900">{job.title}</p>
                        <p className="text-ink-500">{job.propertyName}</p>
                      </td>
                      <td className="px-5 py-4 text-ink-700">{job.clientName}</td>
                      <td className="px-5 py-4">
                        <PriorityBadge priority={job.priority} />
                      </td>
                      <td className="px-5 py-4 text-ink-700">
                        {formatDate(job.dueDate)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={job.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-5 text-sm text-ink-500">No jobs found.</div>
          )}
        </div>

        <div className="panel p-5">
          <h2 className="text-base font-semibold text-ink-900">
            Job status summary
          </h2>
          <div className="mt-5 space-y-4">
            {isLoading ? (
              <p className="text-sm text-ink-500">Loading status summary...</p>
            ) : dashboard?.statusSummary?.length ? (
              dashboard.statusSummary.map((item) => (
                <div key={item.status}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <StatusBadge status={item.status} />
                    <span className="text-ink-500">{item.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-ink-100">
                    <div
                      className="h-2 rounded-full bg-brand-600"
                      style={{ width: `${(item.count / maxStatusCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-ink-500">No status data yet.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboardPage;
