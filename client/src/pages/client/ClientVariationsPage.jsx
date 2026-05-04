import { useEffect, useState } from 'react';

import { clientApi } from '../../api/clientApi.js';
import { getUploadUrl } from '../../api/operativeApi.js';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ImageAttachment from '../../components/ui/ImageAttachment.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import SearchInput from '../../components/ui/SearchInput.jsx';
import Select from '../../components/ui/Select.jsx';
import StatusBadge from '../../components/ui/StatusBadge.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import { variationStatuses } from '../../utils/constants.js';
import {
  formatDateTime,
  formatOptionalCurrency
} from '../../utils/formatters.js';

const ClientVariationsPage = () => {
  const [variations, setVariations] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    status: ''
  });
  const [decisionNotes, setDecisionNotes] = useState({});
  const [decisionTarget, setDecisionTarget] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeciding, setIsDeciding] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadVariations = async () => {
    setIsLoading(true);
    setError('');

    try {
      setVariations(await clientApi.getVariations(filters));
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

  const setDecisionNote = (variationId, value) => {
    setDecisionNotes((current) => ({ ...current, [variationId]: value }));
  };

  const confirmDecision = async () => {
    setIsDeciding(true);
    setError('');
    setMessage('');

    try {
      const updatedVariation = await clientApi.decideVariation(
        decisionTarget.variation.id,
        {
          decision: decisionTarget.decision,
          clientDecisionNote: decisionNotes[decisionTarget.variation.id] || ''
        }
      );
      setVariations((current) =>
        current
          .map((variation) =>
            variation.id === updatedVariation.id ? updatedVariation : variation
          )
          .filter(
            (variation) => !filters.status || variation.status === filters.status
          )
      );
      setDecisionTarget(null);
      setMessage(
        decisionTarget.decision === 'approved'
          ? 'Variation approved.'
          : 'Variation rejected.'
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || 'Unable to update variation.'
      );
    } finally {
      setIsDeciding(false);
    }
  };

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Client approvals"
        title="Variations"
        description="Review priced extra work requests and approve or reject them before work proceeds."
      />

      <div className="grid gap-3 md:grid-cols-[1fr_240px]">
        <SearchInput
          value={filters.search}
          onChange={(value) => setFilter('search', value)}
          placeholder="Search jobs, properties, or variation details"
        />
        <Select
          label="Status"
          name="clientVariationStatusFilter"
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
      {message ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}

      {isLoading ? (
        <div className="panel p-6 text-sm font-medium text-ink-500">
          Loading variations...
        </div>
      ) : variations.length ? (
        <div className="grid gap-4">
          {variations.map((variation) => {
            const canDecide = variation.status === 'pending_client_approval';
            const imageUrl = getUploadUrl(variation.photoUrl);

            return (
              <article key={variation.id} className="panel p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-ink-900">
                      {variation.description}
                    </h2>
                    <p className="mt-1 text-sm text-ink-500">
                      {variation.job.title} / {variation.job.property.name}
                    </p>
                  </div>
                  <StatusBadge status={variation.status} />
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="grid gap-4 text-sm leading-6 text-ink-700">
                    <div>
                      <p className="font-semibold text-ink-900">Reason</p>
                      <p className="mt-1 whitespace-pre-line">
                        {variation.reason}
                      </p>
                    </div>
                    <div className="grid gap-3 rounded-md bg-ink-50 p-4 md:grid-cols-2">
                      <p>
                        Property:{' '}
                        <span className="font-medium text-ink-900">
                          {variation.job.property.addressLine1},{' '}
                          {variation.job.property.postcode}
                        </span>
                      </p>
                      <p>
                        Raised:{' '}
                        <span className="font-medium text-ink-900">
                          {formatDateTime(variation.createdAt)}
                        </span>
                      </p>
                      <p>
                        Operative estimate:{' '}
                        <span className="font-medium text-ink-900">
                          {formatOptionalCurrency(variation.estimatedAmount)}
                        </span>
                      </p>
                      <p>
                        Admin price:{' '}
                        <span className="font-medium text-ink-900">
                          {formatOptionalCurrency(variation.adminPrice)}
                        </span>
                      </p>
                    </div>
                    {variation.clientDecisionNote ? (
                      <div className="rounded-md border border-ink-100 p-4">
                        <p className="font-semibold text-ink-900">
                          Decision note
                        </p>
                        <p className="mt-1">{variation.clientDecisionNote}</p>
                      </div>
                    ) : null}
                    {imageUrl ? (
                      <ImageAttachment
                        src={imageUrl}
                        alt={`${variation.description} variation photo`}
                      />
                    ) : null}
                  </div>

                  <div className="rounded-lg border border-ink-100 p-4">
                    <h3 className="text-base font-semibold text-ink-900">
                      Client decision
                    </h3>
                    <p className="mt-1 text-sm text-ink-500">
                      Approve the priced variation or reject it with a note.
                    </p>
                    <div className="mt-4">
                      <Textarea
                        label="Decision note"
                        name={`decision-note-${variation.id}`}
                        value={decisionNotes[variation.id] || ''}
                        onChange={(event) =>
                          setDecisionNote(variation.id, event.target.value)
                        }
                        disabled={!canDecide}
                      />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        disabled={!canDecide}
                        onClick={() =>
                          setDecisionTarget({
                            variation,
                            decision: 'approved'
                          })
                        }
                        className="rounded-md bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-900 disabled:bg-ink-300"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={!canDecide}
                        onClick={() =>
                          setDecisionTarget({
                            variation,
                            decision: 'rejected'
                          })
                        }
                        className="rounded-md border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:border-ink-100 disabled:text-ink-300"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No variations found"
          description="Priced variation requests for your properties will appear here."
        />
      )}

      <ConfirmModal
        isOpen={Boolean(decisionTarget)}
        title={
          decisionTarget?.decision === 'approved'
            ? 'Approve variation'
            : 'Reject variation'
        }
        description={`Confirm this ${
          decisionTarget?.decision === 'approved' ? 'approval' : 'rejection'
        } for ${decisionTarget?.variation.description}.`}
        confirmLabel={
          decisionTarget?.decision === 'approved'
            ? 'Approve variation'
            : 'Reject variation'
        }
        isWorking={isDeciding}
        onCancel={() => setDecisionTarget(null)}
        onConfirm={confirmDecision}
      />
    </div>
  );
};

export default ClientVariationsPage;
