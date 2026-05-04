import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Plus,
  Users
} from 'lucide-react';

import { adminApi } from '../../api/adminApi.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import ActionButton from '../../components/ui/ActionButton.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import PriorityBadge from '../../components/ui/PriorityBadge.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { jobStatuses } from '../../utils/constants.js';
import { formatDate } from '../../utils/formatters.js';

const getJobCode = (id) => `JOB-${String(id).padStart(4, '0')}`;

const getDateValue = (value) => {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isActiveJob = (job) =>
  !['completed', 'cancelled'].includes(String(job.status));

const isOverdue = (job) => {
  const dueDate = getDateValue(job.dueDate);

  if (!dueDate || !isActiveJob(job)) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return dueDate < today;
};

const getStatusLabel = (value) =>
  jobStatuses.find((status) => status.value === value)?.label || value;

const DashboardKpiCard = ({ helper, icon: Icon, label, tone, value }) => {
  const tones = {
    blue: 'bg-brand-50 text-brand-600 ring-brand-100',
    green: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
    amber: 'bg-amber-50 text-amber-600 ring-amber-100',
    violet: 'bg-violet-50 text-violet-600 ring-violet-100',
    rose: 'bg-rose-50 text-rose-600 ring-rose-100'
  };

  return (
    <div className="rounded-xl border border-ink-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-ink-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold leading-none text-ink-900">
            {value}
          </p>
          <p className="mt-2 text-xs font-medium text-ink-500">{helper}</p>
        </div>
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 ${tones[tone]}`}>
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
};

const CompactJobCard = ({ job }) => (
  <div className="rounded-xl border border-ink-100 bg-white px-4 py-3">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-brand-600">
          {getJobCode(job.id)}
        </p>
        <p className="mt-1 truncate text-sm font-semibold text-ink-900">
          {job.title}
        </p>
        <p className="mt-1 truncate text-xs text-ink-500">
          {job.propertyName} · {job.clientName}
        </p>
      </div>
      <PriorityBadge priority={job.priority} />
    </div>
    <div className="mt-3 flex items-center justify-between gap-3 text-xs text-ink-500">
      <StatusBadge status={job.status} />
      <span>{formatDate(job.dueDate)}</span>
    </div>
  </div>
);

const AdminDashboardPage = () => {
  const { user } = useAuth();
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
          requestError.response?.data?.message || 'Unable to load dashboard.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const metrics = dashboard?.metrics || {};
  const recentJobs = dashboard?.recentJobs || [];
  const statusSummary = dashboard?.statusSummary || [];

  const statusTotal = statusSummary.reduce(
    (total, item) => total + Number(item.count || 0),
    0
  );
  const maxStatusCount = Math.max(
    1,
    ...statusSummary.map((item) => Number(item.count || 0))
  );

  const overview = useMemo(() => {
    const activeJobs = Number(metrics.activeJobs || 0);
    const completedJobs = Number(metrics.completedJobs || 0);
    const pendingJobs = Number(metrics.pendingJobs || 0);
    const totalTracked = activeJobs + completedJobs;
    const completionRate = totalTracked
      ? Math.round((completedJobs / totalTracked) * 100)
      : 0;

    return {
      activeJobs,
      completedJobs,
      completionRate,
      pendingJobs,
      totalClients: Number(metrics.totalClients || 0),
      totalProperties: Number(metrics.totalProperties || 0)
    };
  }, [metrics]);

  const overdueJobs = useMemo(
    () => recentJobs.filter(isOverdue).slice(0, 4),
    [recentJobs]
  );

  const upcomingJobs = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return recentJobs
      .filter((job) => {
        const dueDate = getDateValue(job.dueDate);
        return dueDate && dueDate >= today && isActiveJob(job);
      })
      .sort((a, b) => getDateValue(a.dueDate) - getDateValue(b.dueDate))
      .slice(0, 5);
  }, [recentJobs]);

  if (isLoading) {
    return (
      <div className="page-shell">
        <div className="panel p-8 text-sm font-medium text-ink-500">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
      {error ? <div className="alert-error">{error}</div> : null}

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className="panel overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-brand-900 text-white">
          <div className="relative flex h-full min-h-[260px] px-6 py-7 sm:px-8">
            <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(47,128,237,0.35),transparent_45%)]" />
            <div className="relative z-10 flex min-h-full w-full max-w-3xl flex-col justify-between gap-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brand-100">
                  Operations overview
                </p>
                <h1 className="mt-4 text-3xl font-semibold tracking-normal text-white">
                  Welcome back, {user?.name || 'Maintenix'}.
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">
                  Monitor workload, service risk, and field activity from one
                  executive view.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs font-medium text-blue-100">Active jobs</p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {overview.activeJobs}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs font-medium text-blue-100">
                    Pending queue
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {overview.pendingJobs}
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs font-medium text-blue-100">
                    Completion rate
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {overview.completionRate}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="panel p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
                Watchlist
              </p>
              <h2 className="mt-2 text-xl font-semibold text-ink-900">
                Items needing attention
              </h2>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
              <AlertTriangle className="h-6 w-6" aria-hidden="true" />
            </span>
          </div>
          <div className="mt-6 grid gap-3">
            <div className="flex items-center justify-between rounded-xl border border-rose-100 bg-rose-50 px-4 py-3">
              <span className="text-sm font-semibold text-rose-800">
                Overdue in recent activity
              </span>
              <span className="text-lg font-semibold text-rose-700">
                {overdueJobs.length}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
              <span className="text-sm font-semibold text-amber-800">
                Pending jobs
              </span>
              <span className="text-lg font-semibold text-amber-700">
                {overview.pendingJobs}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-brand-100 bg-brand-50 px-4 py-3">
              <span className="text-sm font-semibold text-brand-800">
                Upcoming due dates
              </span>
              <span className="text-lg font-semibold text-brand-700">
                {upcomingJobs.length}
              </span>
            </div>
          </div>
          <ActionButton
            as={Link}
            to="/admin/jobs"
            variant="secondary"
            className="mt-5 w-full justify-center"
          >
            Review job queue
          </ActionButton>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <DashboardKpiCard
          helper="Managed accounts"
          icon={Users}
          label="Clients"
          tone="blue"
          value={overview.totalClients}
        />
        <DashboardKpiCard
          helper="Sites under maintenance"
          icon={Building2}
          label="Properties"
          tone="violet"
          value={overview.totalProperties}
        />
        <DashboardKpiCard
          helper="Open operational work"
          icon={ClipboardList}
          label="Active Jobs"
          tone="amber"
          value={overview.activeJobs}
        />
        <DashboardKpiCard
          helper="Completed work orders"
          icon={CheckCircle2}
          label="Completed"
          tone="green"
          value={overview.completedJobs}
        />
        <DashboardKpiCard
          helper="Awaiting action"
          icon={Clock3}
          label="Pending"
          tone="rose"
          value={overview.pendingJobs}
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
        <div className="panel p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
                Job status
              </p>
              <h2 className="mt-2 text-xl font-semibold text-ink-900">
                Current work mix
              </h2>
              <p className="mt-1 text-sm text-ink-500">
                Breakdown of all jobs by status.
              </p>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 ring-1 ring-brand-100">
              <BarChart3 className="h-6 w-6" aria-hidden="true" />
            </span>
          </div>

          <div className="mt-6 grid gap-4">
            {statusSummary.length ? (
              statusSummary.map((item) => {
                const width = Math.max(
                  7,
                  Math.round((Number(item.count || 0) / maxStatusCount) * 100)
                );

                return (
                  <div key={item.status}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-semibold text-ink-700">
                        {getStatusLabel(item.status)}
                      </span>
                      <span className="text-ink-500">{item.count}</span>
                    </div>
                    <div className="h-3 rounded-full bg-ink-50">
                      <div
                        className="h-3 rounded-full bg-brand-600"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="rounded-xl border border-dashed border-ink-200 bg-ink-50 px-4 py-6 text-center text-sm text-ink-500">
                No status data available yet.
              </p>
            )}
          </div>
          <div className="mt-5 rounded-xl bg-ink-50 px-4 py-3 text-sm text-ink-600">
            {statusTotal} total jobs are represented in this status summary.
          </div>
        </div>

        <div className="panel p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
                Schedule
              </p>
              <h2 className="mt-2 text-xl font-semibold text-ink-900">
                Upcoming due dates
              </h2>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600 ring-1 ring-violet-100">
              <CalendarClock className="h-6 w-6" aria-hidden="true" />
            </span>
          </div>
          <div className="mt-5 grid gap-3">
            {upcomingJobs.length ? (
              upcomingJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-ink-100 bg-white px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink-900">
                      {job.title}
                    </p>
                    <p className="mt-1 truncate text-xs text-ink-500">
                      {job.propertyName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-ink-800">
                      {formatDate(job.dueDate)}
                    </p>
                    <p className="mt-1 text-xs text-ink-500">
                      {job.operativeName || 'Unassigned'}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState
                title="No upcoming due dates"
                description="Recent jobs do not include upcoming active due dates."
              />
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(360px,0.82fr)_minmax(0,1.18fr)]">
        <div className="panel p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-600">
                Risk
              </p>
              <h2 className="mt-2 text-xl font-semibold text-ink-900">
                Overdue alerts
              </h2>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
              <AlertTriangle className="h-6 w-6" aria-hidden="true" />
            </span>
          </div>
          <div className="mt-5 grid gap-3">
            {overdueJobs.length ? (
              overdueJobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-rose-950">
                        {job.title}
                      </p>
                      <p className="mt-1 truncate text-xs text-rose-700">
                        Due {formatDate(job.dueDate)} · {job.clientName}
                      </p>
                    </div>
                    <StatusBadge status={job.status} />
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-6 text-center text-sm font-medium text-emerald-700">
                No overdue jobs in recent activity.
              </p>
            )}
          </div>
        </div>

        <div className="panel p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
                Activity
              </p>
              <h2 className="mt-2 text-xl font-semibold text-ink-900">
                Recent jobs
              </h2>
              <p className="mt-1 text-sm text-ink-500">
                Latest work orders for quick monitoring.
              </p>
            </div>
            <Link
              to="/admin/jobs"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:text-brand-900"
            >
              Open jobs
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {recentJobs.length ? (
              recentJobs.slice(0, 6).map((job) => (
                <CompactJobCard key={job.id} job={job} />
              ))
            ) : (
              <div className="md:col-span-2">
                <EmptyState
                  title="No recent jobs"
                  description="New work orders will appear here once created."
                  action={
                    <ActionButton as={Link} to="/admin/jobs/new" icon={Plus}>
                      New Job
                    </ActionButton>
                  }
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboardPage;
