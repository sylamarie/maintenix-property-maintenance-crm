import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, ClipboardCheck, Clock3, FileCheck2 } from 'lucide-react';

import { clientApi } from '../../api/clientApi.js';
import EmptyState from '../../components/ui/EmptyState.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import PriorityBadge from '../../components/ui/PriorityBadge.jsx';
import StatCard from '../../components/ui/StatCard.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import {
  formatDate,
  formatDateTime,
  formatOptionalCurrency
} from '../../utils/formatters.js';

const ClientDashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      setError('');

      try {
        setDashboard(await clientApi.getDashboard());
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            'Unable to load client dashboard.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="page-shell">
        <div className="panel p-6 text-sm font-medium text-ink-500">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Client portal"
        title="Dashboard"
        description="Track property maintenance jobs, completion activity, and variation approvals."
      />

      {error ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {dashboard ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Properties"
              value={dashboard.metrics.totalProperties}
              icon={Building2}
            />
            <StatCard
              label="Active jobs"
              value={dashboard.metrics.activeJobs}
              icon={ClipboardCheck}
            />
            <StatCard
              label="Completed jobs"
              value={dashboard.metrics.completedJobs}
              icon={FileCheck2}
            />
            <StatCard
              label="Pending approvals"
              value={dashboard.metrics.pendingVariationApprovals}
              icon={Clock3}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <article className="panel overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
                <h2 className="text-base font-semibold text-ink-900">
                  Recent jobs
                </h2>
                <Link
                  to="/client/jobs"
                  className="text-sm font-semibold text-brand-700 hover:text-brand-900"
                >
                  View all
                </Link>
              </div>
              {dashboard.recentJobs.length ? (
                <div className="divide-y divide-ink-100">
                  {dashboard.recentJobs.map((job) => (
                    <Link
                      key={job.id}
                      to={`/client/jobs/${job.id}`}
                      className="block px-5 py-4 hover:bg-ink-50"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-ink-900">
                            {job.title}
                          </p>
                          <p className="mt-1 text-sm text-ink-500">
                            {job.property.name} / Due {formatDate(job.dueDate)}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <StatusBadge status={job.status} />
                          <PriorityBadge priority={job.priority} />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No recent jobs"
                  description="Jobs for your managed properties will appear here."
                />
              )}
            </article>

            <article className="panel overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-ink-100 px-5 py-4">
                <h2 className="text-base font-semibold text-ink-900">
                  Recent variations
                </h2>
                <Link
                  to="/client/variations"
                  className="text-sm font-semibold text-brand-700 hover:text-brand-900"
                >
                  View all
                </Link>
              </div>
              {dashboard.recentVariations.length ? (
                <div className="divide-y divide-ink-100">
                  {dashboard.recentVariations.map((variation) => (
                    <div key={variation.id} className="px-5 py-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-ink-900">
                            {variation.description}
                          </p>
                          <p className="mt-1 text-sm text-ink-500">
                            {variation.job.title} /{' '}
                            {variation.job.propertyName}
                          </p>
                          <p className="mt-1 text-xs text-ink-500">
                            {formatDateTime(variation.createdAt)}
                          </p>
                        </div>
                        <div className="grid justify-items-end gap-2">
                          <StatusBadge status={variation.status} />
                          <span className="text-sm font-semibold text-ink-900">
                            {formatOptionalCurrency(variation.adminPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No recent variations"
                  description="Priced extra work requests will appear here."
                />
              )}
            </article>
          </section>
        </>
      ) : null}
    </div>
  );
};

export default ClientDashboardPage;
