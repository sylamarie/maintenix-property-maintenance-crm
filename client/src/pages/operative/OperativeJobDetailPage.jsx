import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FileText } from 'lucide-react';

import { getUploadUrl, operativeApi } from '../../api/operativeApi.js';
import EmptyState from '../../components/ui/EmptyState.jsx';
import FormInput from '../../components/ui/FormInput.jsx';
import ImageAttachment from '../../components/ui/ImageAttachment.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import PriorityBadge from '../../components/ui/PriorityBadge.jsx';
import Select from '../../components/ui/Select.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import {
  formatDate,
  formatDateTime,
  formatOptionalCurrency
} from '../../utils/formatters.js';

const operativeStatuses = [
  { value: 'in_progress', label: 'In Progress' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' }
];

const photoTypes = [
  { value: 'before', label: 'Before' },
  { value: 'after', label: 'After' },
  { value: 'general', label: 'General' }
];

const getPhotoFileUrl = (photo) => photo.fileUrl || photo.file_url || '';
const getPhotoType = (photo) => photo.photoType || photo.photo_type;
const getVariationPhotoUrl = (variation) =>
  variation.photoUrl || variation.photo_url || '';

const PhotoCard = ({ photo, label }) => {
  const [hasImageError, setHasImageError] = useState(false);
  const createdAt = photo.createdAt || photo.created_at;
  const imageUrl = getUploadUrl(getPhotoFileUrl(photo));

  return (
    <figure className="overflow-hidden rounded-lg border border-ink-100 bg-white shadow-sm">
      <div className="h-52 w-full overflow-hidden bg-ink-50">
        {imageUrl && !hasImageError ? (
          <img
            src={imageUrl}
            alt={photo.caption || `${label} job photo`}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={() => setHasImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm text-ink-500">
            Photo preview unavailable
          </div>
        )}
      </div>
      <figcaption className="space-y-3 p-4 text-sm">
        <p className="min-h-5 text-ink-700">{photo.caption || 'No caption'}</p>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ink-100 pt-3">
          <p className="text-xs text-ink-400">{formatDateTime(createdAt)}</p>
          {imageUrl ? (
            <a
              href={imageUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-brand-700 hover:text-brand-900"
            >
              Open photo
            </a>
          ) : null}
        </div>
      </figcaption>
    </figure>
  );
};

const VariationCard = ({ variation }) => {
  const imageUrl = getUploadUrl(getVariationPhotoUrl(variation));

  return (
    <article className="rounded-lg border border-ink-100 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-ink-900">{variation.description}</p>
          <p className="mt-1 text-sm text-ink-500">
            Raised {formatDateTime(variation.createdAt || variation.created_at)}
          </p>
        </div>
        <StatusBadge status={variation.status} />
      </div>
      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-ink-700">
        {variation.reason}
      </p>
      <div className="mt-4 grid gap-2 text-sm text-ink-700 md:grid-cols-2">
        <p>
          Estimate:{' '}
          <span className="font-semibold text-ink-900">
            {formatOptionalCurrency(
              variation.estimatedAmount ?? variation.estimated_amount
            )}
          </span>
        </p>
        <p>
          Admin price:{' '}
          <span className="font-semibold text-ink-900">
            {formatOptionalCurrency(variation.adminPrice ?? variation.admin_price)}
          </span>
        </p>
      </div>
      {variation.clientDecisionNote || variation.client_decision_note ? (
        <div className="mt-4 rounded-md bg-ink-50 p-3 text-sm text-ink-700">
          <p className="font-semibold text-ink-900">Client decision note</p>
          <p className="mt-1">
            {variation.clientDecisionNote || variation.client_decision_note}
          </p>
        </div>
      ) : null}
      {imageUrl ? (
      <div className="mt-4">
        <ImageAttachment
          src={imageUrl}
          alt={`${variation.description} variation photo`}
        />
      </div>
      ) : null}
    </article>
  );
};

const OperativeJobDetailPage = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [notes, setNotes] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [variations, setVariations] = useState([]);
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [photoForm, setPhotoForm] = useState({
    photoType: 'before',
    caption: '',
    file: null
  });
  const [variationForm, setVariationForm] = useState({
    description: '',
    reason: '',
    estimatedAmount: '',
    file: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isRaisingVariation, setIsRaisingVariation] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusError, setStatusError] = useState('');
  const [noteMessage, setNoteMessage] = useState('');
  const [noteError, setNoteError] = useState('');
  const [photoMessage, setPhotoMessage] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [variationMessage, setVariationMessage] = useState('');
  const [variationError, setVariationError] = useState('');

  const groupedPhotos = useMemo(() => {
    return photos.reduce((groups, photo) => {
      const photoType = getPhotoType(photo);

      if (!photoType) {
        return groups;
      }

      groups[photoType] = groups[photoType] || [];
      groups[photoType].push(photo);
      return groups;
    }, {});
  }, [photos]);

  const loadJob = async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const result = await operativeApi.getJob(id);
      setJob(result.job);
      setNotes(result.notes);
      setPhotos(result.photos);
      setVariations(result.variations || []);
      setStatus(
        operativeStatuses.some((item) => item.value === result.job.status)
          ? result.job.status
          : 'in_progress'
      );
    } catch (requestError) {
      setLoadError(
        requestError.response?.data?.message || 'Unable to load job details.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJob();
  }, [id]);

  const handleStatusSubmit = async (event) => {
    event.preventDefault();
    setIsSavingStatus(true);
    setStatusError('');
    setStatusMessage('');

    try {
      const updatedJob = await operativeApi.updateStatus(id, status);
      setJob(updatedJob);
      setStatus(updatedJob.status);
      setStatusMessage('Job status updated.');
    } catch (requestError) {
      setStatusError(
        requestError.response?.data?.message || 'Unable to update status.'
      );
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleNoteSubmit = async (event) => {
    event.preventDefault();

    if (!note.trim()) {
      setNoteError('Enter a note before adding it.');
      setNoteMessage('');
      return;
    }

    setIsAddingNote(true);
    setNoteError('');
    setNoteMessage('');

    try {
      const createdNote = await operativeApi.addNote({
        jobId: id,
        note: note.trim()
      });
      setNotes((current) => [createdNote, ...current]);
      setNote('');
      setNoteMessage('Note added.');
    } catch (requestError) {
      setNoteError(requestError.response?.data?.message || 'Unable to add note.');
    } finally {
      setIsAddingNote(false);
    }
  };

  const handlePhotoSubmit = async (event) => {
    event.preventDefault();

    if (!photoForm.file) {
      setPhotoError('Choose a photo before uploading.');
      setPhotoMessage('');
      return;
    }

    setIsUploading(true);
    setPhotoError('');
    setPhotoMessage('');

    try {
      const createdPhoto = await operativeApi.uploadPhoto({
        jobId: id,
        photoType: photoForm.photoType,
        caption: photoForm.caption,
        file: photoForm.file
      });
      setPhotos((current) => [createdPhoto, ...current]);
      setPhotoForm({ photoType: 'before', caption: '', file: null });
      event.target.reset();
      setPhotoMessage('Photo uploaded.');
    } catch (requestError) {
      setPhotoError(
        requestError.response?.data?.message || 'Unable to upload photo.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleVariationSubmit = async (event) => {
    event.preventDefault();

    if (!variationForm.description.trim() || !variationForm.reason.trim()) {
      setVariationError('Description and reason are required.');
      setVariationMessage('');
      return;
    }

    setIsRaisingVariation(true);
    setVariationError('');
    setVariationMessage('');

    try {
      const createdVariation = await operativeApi.createVariation({
        jobId: id,
        description: variationForm.description.trim(),
        reason: variationForm.reason.trim(),
        estimatedAmount: variationForm.estimatedAmount,
        file: variationForm.file
      });
      setVariations((current) => [createdVariation, ...current]);
      setVariationForm({
        description: '',
        reason: '',
        estimatedAmount: '',
        file: null
      });
      event.target.reset();
      setVariationMessage('Variation request raised for admin review.');
    } catch (requestError) {
      setVariationError(
        requestError.response?.data?.message || 'Unable to raise variation.'
      );
    } finally {
      setIsRaisingVariation(false);
    }
  };

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
          description={loadError || 'This job is not assigned to your account.'}
          action={
            <Link
              to="/operative/jobs"
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
        eyebrow="Assigned job"
        title={job.title}
        description={`${job.client.name} / ${job.property.name}`}
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
              to="/operative/jobs"
              className="rounded-md border border-ink-100 px-4 py-2.5 text-sm font-semibold text-ink-700 hover:bg-ink-50"
            >
              Back to jobs
            </Link>
          </div>
        }
      />

      {loadError ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          {loadError}
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
            <div className="mt-5 grid gap-3 text-sm text-ink-700 md:grid-cols-2">
              <p>Scheduled: {formatDate(job.scheduledDate)}</p>
              <p>Due: {formatDate(job.dueDate)}</p>
              <p>Completed: {formatDate(job.completionDate)}</p>
              <p>Photos: {photos.length}</p>
            </div>
          </article>

          <article className="panel p-5">
            <h2 className="text-base font-semibold text-ink-900">
              Client and property
            </h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-ink-900">
                  {job.client.name}
                </p>
                <p className="mt-1 text-sm text-ink-500">
                  {job.client.contactName}
                </p>
                <p className="mt-1 text-sm text-ink-500">{job.client.phone}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-ink-900">
                  {job.property.name}
                </p>
                <p className="mt-1 text-sm text-ink-500">
                  {job.property.addressLine1}
                  {job.property.addressLine2
                    ? `, ${job.property.addressLine2}`
                    : ''}
                </p>
                <p className="mt-1 text-sm text-ink-500">
                  {job.property.city}, {job.property.postcode}
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-md bg-ink-50 p-4 text-sm text-ink-700">
              <p className="font-semibold text-ink-900">Access notes</p>
              <p className="mt-1">
                {job.property.accessNotes || 'No access notes recorded.'}
              </p>
            </div>
          </article>

          <article className="panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-ink-900">
                  Variations
                </h2>
                <p className="mt-1 text-sm text-ink-500">
                  Raise extra work for admin pricing and client approval.
                </p>
              </div>
              <span className="rounded-full bg-ink-50 px-2.5 py-1 text-xs font-medium text-ink-500">
                {variations.length}
              </span>
            </div>

            <form
              className="mt-5 grid gap-4"
              onSubmit={handleVariationSubmit}
            >
              <Textarea
                label="Extra work description"
                name="variationDescription"
                value={variationForm.description}
                onChange={(event) => {
                  setVariationError('');
                  setVariationMessage('');
                  setVariationForm((current) => ({
                    ...current,
                    description: event.target.value
                  }));
                }}
                required
              />
              <Textarea
                label="Reason"
                name="variationReason"
                value={variationForm.reason}
                onChange={(event) => {
                  setVariationError('');
                  setVariationMessage('');
                  setVariationForm((current) => ({
                    ...current,
                    reason: event.target.value
                  }));
                }}
                required
              />
              <div className="grid gap-4 md:grid-cols-2">
                <FormInput
                  label="Estimated amount"
                  name="estimatedAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={variationForm.estimatedAmount}
                  onChange={(event) =>
                    setVariationForm((current) => ({
                      ...current,
                      estimatedAmount: event.target.value
                    }))
                  }
                  placeholder="Optional"
                />
                <FormInput
                  label="Supporting photo"
                  name="variationPhoto"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) =>
                    setVariationForm((current) => ({
                      ...current,
                      file: event.target.files?.[0] || null
                    }))
                  }
                />
              </div>
              <div>
                <button
                  type="submit"
                  disabled={isRaisingVariation}
                  className="rounded-md bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-900 disabled:bg-ink-300"
                >
                  {isRaisingVariation ? 'Raising...' : 'Raise variation'}
                </button>
              </div>
            </form>

            {variationError ? (
              <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
                {variationError}
              </div>
            ) : null}
            {variationMessage ? (
              <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
                {variationMessage}
              </div>
            ) : null}

            {variations.length ? (
              <div className="mt-6 grid gap-3">
                {variations.map((variation) => (
                  <VariationCard key={variation.id} variation={variation} />
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-md border border-dashed border-ink-200 p-5 text-sm text-ink-500">
                No variations raised for this job.
              </div>
            )}
          </article>

          <article className="panel p-5">
            <h2 className="text-base font-semibold text-ink-900">Photos</h2>
            <form
              className="mt-4 grid gap-4 md:grid-cols-[180px_1fr] xl:grid-cols-[180px_1fr_1fr]"
              onSubmit={handlePhotoSubmit}
            >
              <Select
                label="Photo type"
                name="photoType"
                value={photoForm.photoType}
                onChange={(event) =>
                  {
                    setPhotoError('');
                    setPhotoMessage('');
                    setPhotoForm((current) => ({
                      ...current,
                      photoType: event.target.value
                    }));
                  }
                }
              >
                {photoTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
              <FormInput
                label="Photo"
                name="photo"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) =>
                  {
                    setPhotoError('');
                    setPhotoMessage('');
                    setPhotoForm((current) => ({
                      ...current,
                      file: event.target.files?.[0] || null
                    }));
                  }
                }
                required
              />
              <FormInput
                label="Caption"
                name="caption"
                value={photoForm.caption}
                onChange={(event) =>
                  setPhotoForm((current) => ({
                    ...current,
                    caption: event.target.value
                  }))
                }
                placeholder="Short description"
              />
              <div className="md:col-span-2 xl:col-span-3">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="rounded-md bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-900 disabled:bg-ink-300"
                >
                {isUploading ? 'Uploading...' : 'Upload photo'}
                </button>
              </div>
            </form>

            {photoError ? (
              <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
                {photoError}
              </div>
            ) : null}
            {photoMessage ? (
              <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
                {photoMessage}
              </div>
            ) : null}

            {photos.length ? (
              <div className="mt-6 grid gap-5">
                {photoTypes.map((type) => {
                  const typePhotos = groupedPhotos[type.value] || [];

                  if (!typePhotos.length) {
                    return null;
                  }

                  return (
                    <div key={type.value}>
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-semibold text-ink-900">
                          {type.label} photos
                        </h3>
                        <span className="rounded-full bg-ink-50 px-2.5 py-1 text-xs font-medium text-ink-500">
                          {typePhotos.length}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                        {typePhotos.map((photo) => (
                          <PhotoCard
                            key={photo.id}
                            photo={photo}
                            label={type.label}
                          />
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
          <form className="panel p-5" onSubmit={handleStatusSubmit}>
            <h2 className="text-base font-semibold text-ink-900">
              Update status
            </h2>
            <div className="mt-4">
              <Select
                label="New status"
                name="status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                {operativeStatuses.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </div>
            <button
              type="submit"
              disabled={isSavingStatus}
              className="mt-4 rounded-md bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-900 disabled:bg-ink-300"
            >
              {isSavingStatus ? 'Updating...' : 'Update status'}
            </button>
            {statusError ? (
              <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {statusError}
              </div>
            ) : null}
            {statusMessage ? (
              <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {statusMessage}
              </div>
            ) : null}
          </form>

          <section className="panel p-5">
            <h2 className="text-base font-semibold text-ink-900">Notes</h2>
            <form className="mt-4 grid gap-3" onSubmit={handleNoteSubmit}>
              <Textarea
                label="Add note"
                name="note"
                value={note}
                onChange={(event) => {
                  setNoteError('');
                  setNoteMessage('');
                  setNote(event.target.value);
                }}
                required
              />
              <button
                type="submit"
                disabled={isAddingNote}
                className="rounded-md bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-900 disabled:bg-ink-300"
              >
                {isAddingNote ? 'Adding...' : 'Add note'}
              </button>
              {noteError ? (
                <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {noteError}
                </div>
              ) : null}
              {noteMessage ? (
                <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {noteMessage}
                </div>
              ) : null}
            </form>

            <div className="mt-5 grid gap-3">
              {notes.length ? (
                notes.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-md border border-ink-100 bg-ink-50 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-ink-900">
                        {item.author.name}
                      </p>
                      <span className="text-xs capitalize text-ink-500">
                        {item.author.role}
                      </span>
                    </div>
                    <p className="mt-2 whitespace-pre-line text-sm text-ink-700">
                      {item.note}
                    </p>
                    <p className="mt-2 text-xs text-ink-400">
                      {formatDateTime(item.createdAt)}
                    </p>
                  </article>
                ))
              ) : (
                <p className="rounded-md border border-dashed border-ink-200 p-4 text-sm text-ink-500">
                  No notes yet.
                </p>
              )}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
};

export default OperativeJobDetailPage;
