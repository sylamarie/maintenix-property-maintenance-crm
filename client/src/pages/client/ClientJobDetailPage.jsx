import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FileText } from 'lucide-react';

import { clientApi } from '../../api/clientApi.js';
import { getUploadUrl } from '../../api/operativeApi.js';
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
  { value: 'before', label: 'Before' },
  { value: 'after', label: 'After' },
  { value: 'general', label: 'General' }
];

const ClientJobDetailPage = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [notes, setNotes] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [variations, setVariations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const groupedPhotos = useMemo(() => {
    return photos.reduce((groups, photo) => {
      groups[photo.photoType] = groups[photo.photoType] || [];
      groups[photo.photoType].push(photo);
      return groups;
    }, {});
  }, [photos]);

  useEffect(() => {
    const loadJob = async () => {
      setIsLoading(true);
      setError('');

      try {
        const result = await clientApi.getJob(id);
        setJob(result.job);
        setNotes(result.notes || []);
        setPhotos(result.photos || []);
        setVariations(result.variations || []);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message || 'Unable to load job details.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadJob();
  }, [id]);

  if (isLoading) {
    return (
      <div className="page-shell">
        <div className="panel p-6 text-sm font-medium text-ink-500">
          Loading job details...
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="page-shell">
        <EmptyState
          title="Job not found"
          description={error || 'This job is not linked to your client account.'}
          action={
            <Link
              to="/client/jobs"
              className="inline-flex rounded-md bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-900"
            >
              Back to jobs
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Client job"
        title={job.title}
        description={`${job.property.name} / ${job.property.postcode}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/reports/jobs/${job.id}`}
              className="inline-flex items-center gap-2 rounded-md bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-900"
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              Report
            </Link>
            <Link
              to="/client/jobs"
              className="rounded-md border border-ink-100 px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50"
            >
              Back to jobs
            </Link>
          </div>
        }
      />

      {error ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="grid gap-6">
          <article className="panel p-5">
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={job.status} />
              <PriorityBadge priority={job.priority} />
            </div>
            <p className="mt-4 whitespace-pre-line text-sm leading-6 text-ink-700">
              {job.description}
            </p>
            <div className="mt-5 grid gap-3 text-sm text-ink-700 md:grid-cols-3">
              <p>Scheduled: {formatDate(job.scheduledDate)}</p>
              <p>Due: {formatDate(job.dueDate)}</p>
              <p>Completed: {formatDate(job.completionDate)}</p>
            </div>
          </article>

          <article className="panel p-5">
            <h2 className="text-base font-semibold text-ink-900">
              Property information
            </h2>
            <div className="mt-4 grid gap-4 text-sm text-ink-700 md:grid-cols-2">
              <div>
                <p className="font-semibold text-ink-900">
                  {job.property.name}
                </p>
                <p className="mt-1">
                  {job.property.addressLine1}
                  {job.property.addressLine2
                    ? `, ${job.property.addressLine2}`
                    : ''}
                </p>
                <p className="mt-1">
                  {job.property.city}, {job.property.postcode}
                </p>
              </div>
              <div className="rounded-md bg-ink-50 p-4">
                <p className="font-semibold text-ink-900">Access notes</p>
                <p className="mt-1">
                  {job.property.accessNotes || 'No access notes recorded.'}
                </p>
              </div>
            </div>
          </article>

          <article className="panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-ink-900">Photos</h2>
              <span className="rounded-full bg-ink-50 px-2.5 py-1 text-xs font-medium text-ink-500">
                {photos.length}
              </span>
            </div>

            {photos.length ? (
              <div className="mt-5 grid gap-5">
                {photoTypes.map((type) => {
                  const typePhotos = groupedPhotos[type.value] || [];

                  if (!typePhotos.length) {
                    return null;
                  }

                  return (
                    <div key={type.value}>
                      <h3 className="text-sm font-semibold text-ink-900">
                        {type.label} photos
                      </h3>
                      <div className="mt-3 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                        {typePhotos.map((photo) => (
                          <div key={photo.id}>
                            <ImageAttachment
                              src={getUploadUrl(photo.fileUrl)}
                              alt={photo.caption || `${type.label} job photo`}
                            />
                            <p className="mt-2 text-sm text-ink-600">
                              {photo.caption || 'No caption'}
                            </p>
                            <p className="mt-1 text-xs text-ink-500">
                              {formatDateTime(photo.createdAt)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-5 rounded-md border border-dashed border-ink-200 p-5 text-sm text-ink-500">
                No photos uploaded yet.
              </div>
            )}
          </article>
        </div>

        <aside className="grid content-start gap-6">
          <section className="panel p-5">
            <h2 className="text-base font-semibold text-ink-900">Job notes</h2>
            <div className="mt-4 grid gap-3">
              {notes.length ? (
                notes.map((note) => (
                  <article
                    key={note.id}
                    className="rounded-md border border-ink-100 bg-ink-50 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-ink-900">
                        {note.author.name}
                      </p>
                      <span className="text-xs capitalize text-ink-500">
                        {note.author.role}
                      </span>
                    </div>
                    <p className="mt-2 whitespace-pre-line text-sm text-ink-700">
                      {note.note}
                    </p>
                    <p className="mt-2 text-xs text-ink-500">
                      {formatDateTime(note.createdAt)}
                    </p>
                  </article>
                ))
              ) : (
                <p className="rounded-md border border-dashed border-ink-200 p-4 text-sm text-ink-500">
                  No notes recorded for this job.
                </p>
              )}
            </div>
          </section>

          <section className="panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-ink-900">
                Variations
              </h2>
              <Link
                to="/client/variations"
                className="text-sm font-semibold text-brand-700 hover:text-brand-900"
              >
                View approvals
              </Link>
            </div>
            <div className="mt-4 grid gap-3">
              {variations.length ? (
                variations.map((variation) => {
                  const imageUrl = getUploadUrl(variation.photoUrl);

                  return (
                    <article
                      key={variation.id}
                      className="rounded-lg border border-ink-100 p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <p className="font-semibold text-ink-900">
                          {variation.description}
                        </p>
                        <StatusBadge status={variation.status} />
                      </div>
                      <p className="mt-2 whitespace-pre-line text-sm text-ink-700">
                        {variation.reason}
                      </p>
                      <div className="mt-3 grid gap-2 text-sm text-ink-700">
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
                      </div>
                      {variation.clientDecisionNote ? (
                        <p className="mt-3 rounded-md bg-ink-50 p-3 text-sm text-ink-700">
                          {variation.clientDecisionNote}
                        </p>
                      ) : null}
                      {imageUrl ? (
                        <div className="mt-3">
                          <ImageAttachment
                            src={imageUrl}
                            alt={`${variation.description} variation photo`}
                          />
                        </div>
                      ) : null}
                    </article>
                  );
                })
              ) : (
                <p className="rounded-md border border-dashed border-ink-200 p-4 text-sm text-ink-500">
                  No variations raised for this job.
                </p>
              )}
            </div>
          </section>

          <section className="panel p-5">
            <h2 className="text-base font-semibold text-ink-900">Report</h2>
            <p className="mt-2 text-sm text-ink-500">
              View the formal job report with notes, photos, variations, and
              print-ready completion information.
            </p>
            <Link
              to={`/reports/jobs/${job.id}`}
              className="mt-4 inline-flex items-center gap-2 rounded-md bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-900"
            >
              <FileText className="h-4 w-4" aria-hidden="true" />
              Open report
            </Link>
          </section>
        </aside>
      </section>
    </div>
  );
};

export default ClientJobDetailPage;
