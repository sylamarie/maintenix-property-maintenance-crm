import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Printer } from 'lucide-react';

import { getUploadUrl } from '../../api/operativeApi.js';
import { reportApi } from '../../api/reportApi.js';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ImageAttachment from '../../components/ui/ImageAttachment.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import PriorityBadge from '../../components/ui/PriorityBadge.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import {
  formatDate,
  formatDateTime,
  formatOptionalCurrency
} from '../../utils/formatters.js';

const photoTypes = [
  { value: 'before', label: 'Before photos' },
  { value: 'after', label: 'After photos' },
  { value: 'general', label: 'General photos' }
];

const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
      {label}
    </p>
    <p className="mt-1 text-sm font-medium text-ink-900">{value}</p>
  </div>
);

const JobReportPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const groupedPhotos = useMemo(() => {
    return (report?.photos || []).reduce((groups, photo) => {
      groups[photo.photoType] = groups[photo.photoType] || [];
      groups[photo.photoType].push(photo);
      return groups;
    }, {});
  }, [report?.photos]);

  useEffect(() => {
    const loadReport = async () => {
      setIsLoading(true);
      setError('');

      try {
        setReport(await reportApi.getJobReport(jobId));
      } catch (requestError) {
        setError(
          requestError.response?.data?.message || 'Unable to load job report.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadReport();
  }, [jobId]);

  if (isLoading) {
    return (
      <div className="page-shell report-page">
        <div className="panel p-6 text-sm font-medium text-ink-500">
          Loading job report...
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="page-shell report-page">
        <EmptyState
          title="Report not available"
          description={error || 'You do not have access to this job report.'}
        />
      </div>
    );
  }

  const { job, notes, variations } = report;

  return (
    <div className="page-shell report-page">
      <div className="no-print">
        <PageHeader
          eyebrow="Job report"
          title={job.title}
          description={`${job.client.name} / ${job.property.name}`}
          action={
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-md bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-900"
            >
              <Printer className="h-4 w-4" aria-hidden="true" />
              Print / Save as PDF
            </button>
          }
        />
      </div>

      <article className="panel report-document overflow-hidden">
        <header className="border-b border-ink-100 bg-white px-6 py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
                Maintenix job report
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-ink-900">
                {job.title}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-ink-600">
                {job.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={job.status} />
              <PriorityBadge priority={job.priority} />
            </div>
          </div>
        </header>

        <div className="grid gap-6 p-6">
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <DetailItem label="Scheduled" value={formatDate(job.scheduledDate)} />
            <DetailItem label="Due" value={formatDate(job.dueDate)} />
            <DetailItem
              label="Completed"
              value={formatDate(job.completionDate)}
            />
            <DetailItem label="Updated" value={formatDateTime(job.updatedAt)} />
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-lg border border-ink-100 p-4">
              <h2 className="text-base font-semibold text-ink-900">Client</h2>
              <div className="mt-3 grid gap-2 text-sm text-ink-700">
                <p className="font-semibold text-ink-900">{job.client.name}</p>
                <p>{job.client.contactName}</p>
                <p>{job.client.email}</p>
                <p>{job.client.phone || 'No phone recorded'}</p>
              </div>
            </div>
            <div className="rounded-lg border border-ink-100 p-4">
              <h2 className="text-base font-semibold text-ink-900">Property</h2>
              <div className="mt-3 grid gap-2 text-sm text-ink-700">
                <p className="font-semibold text-ink-900">{job.property.name}</p>
                <p>
                  {job.property.addressLine1}
                  {job.property.addressLine2
                    ? `, ${job.property.addressLine2}`
                    : ''}
                </p>
                <p>
                  {job.property.city}, {job.property.postcode}
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-ink-100 p-4">
              <h2 className="text-base font-semibold text-ink-900">
                Assigned operative
              </h2>
              <div className="mt-3 grid gap-2 text-sm text-ink-700">
                <p className="font-semibold text-ink-900">
                  {job.assignedOperative?.name || 'Unassigned'}
                </p>
                <p>{job.assignedOperative?.email || 'No email recorded'}</p>
                <p>{job.assignedOperative?.phone || 'No phone recorded'}</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-ink-900">Timeline</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <DetailItem label="Created" value={formatDateTime(job.createdAt)} />
              <DetailItem label="Scheduled" value={formatDate(job.scheduledDate)} />
              <DetailItem label="Due" value={formatDate(job.dueDate)} />
              <DetailItem
                label="Completion"
                value={formatDate(job.completionDate)}
              />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-ink-900">Job notes</h2>
            {notes.length ? (
              <div className="mt-3 grid gap-3">
                {notes.map((note) => (
                  <article
                    key={note.id}
                    className="rounded-lg border border-ink-100 bg-ink-50 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-ink-900">
                        {note.author.name}
                      </p>
                      <span className="text-xs capitalize text-ink-500">
                        {note.author.role} / {formatDateTime(note.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-ink-700">
                      {note.note}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-3 rounded-md border border-dashed border-ink-200 p-4 text-sm text-ink-500">
                No notes recorded for this job.
              </p>
            )}
          </section>

          <section>
            <h2 className="text-lg font-semibold text-ink-900">Photos</h2>
            <div className="mt-4 grid gap-6">
              {photoTypes.map((type) => {
                const typePhotos = groupedPhotos[type.value] || [];

                return (
                  <div key={type.value}>
                    <h3 className="text-sm font-semibold text-ink-900">
                      {type.label}
                    </h3>
                    {typePhotos.length ? (
                      <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {typePhotos.map((photo) => (
                          <div key={photo.id}>
                            <ImageAttachment
                              src={getUploadUrl(photo.fileUrl)}
                              alt={photo.caption || `${type.label} job photo`}
                              loading="eager"
                            />
                            <p className="mt-2 text-sm text-ink-700">
                              {photo.caption || 'No caption'}
                            </p>
                            <p className="mt-1 text-xs text-ink-500">
                              {formatDateTime(photo.createdAt)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 rounded-md border border-dashed border-ink-200 p-4 text-sm text-ink-500">
                        No {type.label.toLowerCase()} uploaded.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-ink-900">Variations</h2>
            {variations.length ? (
              <div className="mt-3 grid gap-4">
                {variations.map((variation) => (
                  <article
                    key={variation.id}
                    className="rounded-lg border border-ink-100 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-ink-900">
                          {variation.description}
                        </p>
                        <p className="mt-1 whitespace-pre-line text-sm leading-6 text-ink-700">
                          {variation.reason}
                        </p>
                      </div>
                      <StatusBadge status={variation.status} />
                    </div>
                    <div className="mt-4 grid gap-3 text-sm text-ink-700 md:grid-cols-3">
                      <p>
                        Estimate:{' '}
                        <span className="font-semibold text-ink-900">
                          {formatOptionalCurrency(variation.estimatedAmount)}
                        </span>
                      </p>
                      <p>
                        Admin price:{' '}
                        <span className="font-semibold text-ink-900">
                          {formatOptionalCurrency(variation.adminPrice)}
                        </span>
                      </p>
                      <p>
                        Raised:{' '}
                        <span className="font-semibold text-ink-900">
                          {formatDateTime(variation.createdAt)}
                        </span>
                      </p>
                    </div>
                    {variation.clientDecisionNote ? (
                      <div className="mt-4 rounded-md bg-ink-50 p-3 text-sm text-ink-700">
                        <p className="font-semibold text-ink-900">
                          Client decision note
                        </p>
                        <p className="mt-1">{variation.clientDecisionNote}</p>
                      </div>
                    ) : null}
                    {variation.photoUrl ? (
                      <div className="mt-4 max-w-md">
                        <ImageAttachment
                          src={getUploadUrl(variation.photoUrl)}
                          alt={`${variation.description} variation photo`}
                          loading="eager"
                        />
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-3 rounded-md border border-dashed border-ink-200 p-4 text-sm text-ink-500">
                No variations recorded for this job.
              </p>
            )}
          </section>
        </div>
      </article>

      <div className="no-print">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex rounded-md border border-ink-100 px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default JobReportPage;
