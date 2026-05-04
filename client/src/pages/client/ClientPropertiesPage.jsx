import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { clientApi } from '../../api/clientApi.js';
import EmptyState from '../../components/ui/EmptyState.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';

const ClientPropertiesPage = () => {
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProperties = async () => {
      setIsLoading(true);
      setError('');

      try {
        setProperties(await clientApi.getProperties());
      } catch (requestError) {
        setError(
          requestError.response?.data?.message || 'Unable to load properties.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadProperties();
  }, []);

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="Client portal"
        title="Properties"
        description="Read-only view of the properties linked to your client account."
      />

      {error ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="panel p-6 text-sm font-medium text-ink-500">
          Loading properties...
        </div>
      ) : properties.length ? (
        <section className="grid gap-4 lg:grid-cols-2">
          {properties.map((property) => (
            <article key={property.id} className="panel p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-ink-900">
                    {property.name}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-ink-600">
                    {property.addressLine1}
                    {property.addressLine2 ? `, ${property.addressLine2}` : ''}
                    <br />
                    {property.city}, {property.postcode}
                  </p>
                </div>
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                  {property.jobCount} jobs
                </span>
              </div>

              <div className="mt-5 grid gap-3 text-sm text-ink-700 md:grid-cols-3">
                <div className="rounded-md bg-ink-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                    Active
                  </p>
                  <p className="mt-2 text-lg font-semibold text-ink-900">
                    {property.activeJobCount}
                  </p>
                </div>
                <div className="rounded-md bg-ink-50 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                    Complete
                  </p>
                  <p className="mt-2 text-lg font-semibold text-ink-900">
                    {property.completedJobCount}
                  </p>
                </div>
                <Link
                  to={`/client/jobs?property=${encodeURIComponent(
                    property.name
                  )}`}
                  className="rounded-md border border-ink-100 p-3 text-sm font-semibold text-brand-700 hover:bg-brand-50"
                >
                  View jobs
                </Link>
              </div>

              <div className="mt-5 rounded-md border border-ink-100 p-4 text-sm text-ink-700">
                <p className="font-semibold text-ink-900">Access notes</p>
                <p className="mt-1">
                  {property.accessNotes || 'No access notes recorded.'}
                </p>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <EmptyState
          title="No properties found"
          description="Your login is not linked to any managed properties yet."
        />
      )}
    </div>
  );
};

export default ClientPropertiesPage;
