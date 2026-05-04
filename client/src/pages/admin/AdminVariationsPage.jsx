import { useEffect, useState } from 'react';

import { adminApi } from '../../api/adminApi.js';
import { getUploadUrl } from '../../api/operativeApi.js';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import FormInput from '../../components/ui/FormInput.jsx';
import ImageAttachment from '../../components/ui/ImageAttachment.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import SearchInput from '../../components/ui/SearchInput.jsx';
import Select from '../../components/ui/Select.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import { variationStatuses } from '../../utils/constants.js';
import {
  formatDateTime,
  formatOptionalCurrency
} from '../../utils/formatters.js';

const AdminVariationsPage = () => {
  const [variations, setVariations] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    status: ''
  });
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [reviewPrice, setReviewPrice] = useState('');
  const [rejectTarget, setRejectTarget] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewing, setIsReviewing] = useState(false);
  const [error, setError] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [message, setMessage] = useState('');

  const loadVariations = async () => {
    setIsLoading(true);
    setError('');

    try {
      setVariations(await adminApi.getVariations(filters));
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || 'Unable to load variations.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVariations();
  }, [filters.search, filters.status]);

  const setFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const selectVariation = (variation) => {
    setSelectedVariation(variation);
    setReviewPrice(variation.adminPrice || '');
    setReviewError('');
    setMessage('');
  };

  const updateVariationInState = (updatedVariation) => {
    setVariations((current) =>
      current
        .map((variation) =>
          variation.id === updatedVariation.id ? updatedVariation : variation
        )
        .filter(
          (variation) => !filters.status || variation.status === filters.status
        )
    );
    setSelectedVariation(updatedVariation);
    setReviewPrice(updatedVariation.adminPrice || '');
  };

  const sendForClientApproval = async (event) => {
    event.preventDefault();

    if (!reviewPrice) {
      setReviewError('Enter an admin price before sending to the client.');
      return;
    }

    setIsReviewing(true);
    setReviewError('');
    setMessage('');

    try {
      const updatedVariation = await adminApi.reviewVariation(
        selectedVariation.id,
        {
          status: 'pending_client_approval',
          adminPrice: reviewPrice
        }
      );
      updateVariationInState(updatedVariation);
      setMessage('Variation sent for client approval.');
    } catch (requestError) {
      setReviewError(
        requestError.response?.data?.message || 'Unable to review variation.'
      );
    } finally {
      setIsReviewing(false);
    }
  };

  const rejectVariation = async () => {
    setIsReviewing(true);
    setReviewError('');
    setMessage('');

    try {
      const updatedVariation = await adminApi.reviewVariation(rejectTarget.id, {
        status: 'rejected',
        adminPrice: reviewPrice || ''
      });
      updateVariationInState(updatedVariation);
      setRejectTarget(null);
      setMessage('Variation rejected.');
    } catch (requestError) {
      setReviewError(
        requestError.response?.data?.message || 'Unable to reject variation.'
      );
    } finally {
      setIsReviewing(false);
    }
  };

  const columns = [
    {
      key: 'request',
      header: 'Variation',
      render: (variation) => (
        <div>
          <p className="font-semibold text-ink-900">{variation.description}</p>
          <p className="mt-1 text-ink-500">
            {variation.job.title} / {variation.job.property.name}
          </p>
        </div>
      )
    },
    {
      key: 'client',
      header: 'Client',
      render: (variation) => (
        <div>
          <p className="font-medium text-ink-800">
            {variation.job.client.name}
          </p>
          <p className="mt-1 text-xs text-ink-500">
            Raised by {variation.raisedBy.name}
          </p>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (variation) => <StatusBadge status={variation.status} />
    },
    {
      key: 'amounts',
      header: 'Amounts',
      render: (variation) => (
        <div className="text-ink-700">
          <p>Estimate: {formatOptionalCurrency(variation.estimatedAmount)}</p>
          <p className="mt-1 text-ink-500">
            Admin: {formatOptionalCurrency(variation.adminPrice)}
          </p>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (variation) => (
        <button
          type="button"
          onClick={() => selectVariation(variation)}
          className="rounded-md border border-ink-100 px-3 py-1.5 font-semibold text-ink-700 hover:bg-ink-50"
        >
          Review
        </button>
      )
    }
  ];

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Variation workflow"
        title="Variations"
        description="Review extra work raised by operatives, price requests, and send them for client approval."
      />

      <div className="grid gap-3 md:grid-cols-[1fr_240px]">
        <SearchInput
          value={filters.search}
          onChange={(value) => setFilter('search', value)}
          placeholder="Search job, client, property, operative, or request"
        />
        <Select
          label="Status"
          name="variationStatusFilter"
          value={filters.status}
          onChange={(event) => setFilter('status', event.target.value)}
        >
          <option value="">All statuses</option>
          {variationStatuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
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
        rows={variations}
        getRowKey={(variation) => variation.id}
        isLoading={isLoading}
        emptyState={
          <EmptyState
            title="No variations found"
            description="Operative variation requests will appear here for pricing and approval."
          />
        }
      />

      {selectedVariation ? (
        <section className="panel grid gap-6 p-5 xl:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-ink-900">
                  {selectedVariation.description}
                </h2>
                <p className="mt-1 text-sm text-ink-500">
                  {selectedVariation.job.client.name} /{' '}
                  {selectedVariation.job.property.name}
                </p>
              </div>
              <StatusBadge status={selectedVariation.status} />
            </div>

            <div className="mt-5 grid gap-4 text-sm text-ink-700 md:grid-cols-2">
              <div className="rounded-md bg-ink-50 p-4">
                <p className="font-semibold text-ink-900">Job</p>
                <p className="mt-1">{selectedVariation.job.title}</p>
                <p className="mt-1 text-ink-500">
                  {selectedVariation.job.property.addressLine1},{' '}
                  {selectedVariation.job.property.city},{' '}
                  {selectedVariation.job.property.postcode}
                </p>
              </div>
              <div className="rounded-md bg-ink-50 p-4">
                <p className="font-semibold text-ink-900">Raised by</p>
                <p className="mt-1">{selectedVariation.raisedBy.name}</p>
                <p className="mt-1 text-ink-500">
                  {formatDateTime(selectedVariation.createdAt)}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 text-sm leading-6 text-ink-700">
              <div>
                <p className="font-semibold text-ink-900">Reason</p>
                <p className="mt-1 whitespace-pre-line">
                  {selectedVariation.reason}
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <p>
                  Estimated amount:{' '}
                  <span className="font-semibold text-ink-900">
                    {formatOptionalCurrency(selectedVariation.estimatedAmount)}
                  </span>
                </p>
                <p>
                  Admin price:{' '}
                  <span className="font-semibold text-ink-900">
                    {formatOptionalCurrency(selectedVariation.adminPrice)}
                  </span>
                </p>
              </div>
              {selectedVariation.clientDecisionNote ? (
                <div className="rounded-md bg-ink-50 p-4">
                  <p className="font-semibold text-ink-900">
                    Client decision note
                  </p>
                  <p className="mt-1">{selectedVariation.clientDecisionNote}</p>
                </div>
              ) : null}
              {selectedVariation.photoUrl ? (
                <ImageAttachment
                  src={getUploadUrl(selectedVariation.photoUrl)}
                  alt={`${selectedVariation.description} variation photo`}
                />
              ) : null}
            </div>
          </div>

          <form className="rounded-lg border border-ink-100 p-4" onSubmit={sendForClientApproval}>
            <h3 className="text-base font-semibold text-ink-900">
              Admin review
            </h3>
            <p className="mt-1 text-sm text-ink-500">
              Add schedule-of-rates pricing before sending the variation to the
              client.
            </p>
            <div className="mt-4">
              <FormInput
                label="Admin price"
                name="adminPrice"
                type="number"
                min="0"
                step="0.01"
                value={reviewPrice}
                onChange={(event) => {
                  setReviewError('');
                  setReviewPrice(event.target.value);
                }}
                disabled={selectedVariation.status !== 'pending_admin_review'}
              />
            </div>
            {reviewError ? (
              <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {reviewError}
              </div>
            ) : null}
            {message ? (
              <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {message}
              </div>
            ) : null}
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={
                  isReviewing ||
                  selectedVariation.status !== 'pending_admin_review'
                }
                className="rounded-md bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-900 disabled:bg-ink-300"
              >
                {isReviewing ? 'Working...' : 'Send for client approval'}
              </button>
              <button
                type="button"
                disabled={
                  isReviewing ||
                  selectedVariation.status !== 'pending_admin_review'
                }
                onClick={() => setRejectTarget(selectedVariation)}
                className="rounded-md border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:border-ink-100 disabled:text-ink-300"
              >
                Reject
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <ConfirmModal
        isOpen={Boolean(rejectTarget)}
        title="Reject variation"
        description={`Reject ${rejectTarget?.description}? This will close the variation and stop it from going to client approval.`}
        confirmLabel="Reject variation"
        isWorking={isReviewing}
        onCancel={() => setRejectTarget(null)}
        onConfirm={rejectVariation}
      />
    </div>
  );
};

export default AdminVariationsPage;
