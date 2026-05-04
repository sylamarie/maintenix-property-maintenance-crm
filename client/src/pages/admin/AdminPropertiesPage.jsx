import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';

import { adminApi } from '../../api/adminApi.js';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import FormInput from '../../components/ui/FormInput.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import SearchInput from '../../components/ui/SearchInput.jsx';
import Select from '../../components/ui/Select.jsx';
import Textarea from '../../components/ui/Textarea.jsx';

const blankForm = {
  clientId: '',
  name: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  postcode: '',
  accessNotes: ''
};

const AdminPropertiesPage = () => {
  const [clients, setClients] = useState([]);
  const [properties, setProperties] = useState([]);
  const [filters, setFilters] = useState({ search: '', clientId: '', postcode: '' });
  const [form, setForm] = useState(blankForm);
  const [editingProperty, setEditingProperty] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const loadLookups = async () => {
    setClients(await adminApi.getClients());
  };

  const loadProperties = async () => {
    setIsLoading(true);
    setError('');

    try {
      setProperties(await adminApi.getProperties(filters));
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || 'Unable to load properties.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLookups().catch(() => setError('Unable to load clients.'));
  }, []);

  useEffect(() => {
    loadProperties();
  }, [filters.search, filters.clientId, filters.postcode]);

  const clientOptions = useMemo(
    () => clients.map((client) => ({ value: client.id, label: client.name })),
    [clients]
  );

  const setFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const openCreateForm = () => {
    setEditingProperty(null);
    setForm({ ...blankForm, clientId: clients[0]?.id || '' });
    setIsFormOpen(true);
    setError('');
  };

  const openEditForm = (property) => {
    setEditingProperty(property);
    setForm({
      clientId: property.clientId || '',
      name: property.name || '',
      addressLine1: property.addressLine1 || '',
      addressLine2: property.addressLine2 || '',
      city: property.city || '',
      postcode: property.postcode || '',
      accessNotes: property.accessNotes || ''
    });
    setIsFormOpen(true);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      if (editingProperty) {
        await adminApi.updateProperty(editingProperty.id, form);
      } else {
        await adminApi.createProperty(form);
      }

      setIsFormOpen(false);
      setEditingProperty(null);
      setForm(blankForm);
      await loadProperties();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || 'Unable to save property.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    setError('');

    try {
      await adminApi.deleteProperty(deleteTarget.id);
      setDeleteTarget(null);
      await loadProperties();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to delete property. Remove linked jobs first.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      key: 'property',
      header: 'Property',
      render: (property) => (
        <div>
          <p className="font-semibold text-ink-900">{property.name}</p>
          <p className="mt-1 text-ink-500">
            {property.addressLine1}, {property.city}, {property.postcode}
          </p>
        </div>
      )
    },
    { key: 'clientName', header: 'Client' },
    {
      key: 'access',
      header: 'Access',
      render: (property) => (
        <p className="max-w-md text-ink-600">
          {property.accessNotes || 'No access notes'}
        </p>
      )
    },
    {
      key: 'jobCount',
      header: 'Jobs',
      render: (property) => <span>{property.jobCount}</span>
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (property) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => openEditForm(property)}
            className="rounded-md border border-ink-100 px-3 py-1.5 font-semibold text-ink-700 hover:bg-ink-50"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(property)}
            className="rounded-md border border-rose-200 px-3 py-1.5 font-semibold text-rose-700 hover:bg-rose-50"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow="CRM"
        title="Properties"
        description="Manage sites, addresses, access notes, and client ownership."
        action={
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 rounded-md bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-900"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add property
          </button>
        }
      />

      <div className="grid gap-3 lg:grid-cols-[1fr_220px_180px]">
        <SearchInput
          value={filters.search}
          onChange={(value) => setFilter('search', value)}
          placeholder="Search property, address, postcode, or client"
        />
        <Select
          label="Client"
          name="clientFilter"
          value={filters.clientId}
          onChange={(event) => setFilter('clientId', event.target.value)}
        >
          <option value="">All clients</option>
          {clientOptions.map((client) => (
            <option key={client.value} value={client.value}>
              {client.label}
            </option>
          ))}
        </Select>
        <FormInput
          label="Postcode"
          name="postcodeFilter"
          value={filters.postcode}
          onChange={(event) => setFilter('postcode', event.target.value)}
          placeholder="NW1"
        />
      </div>

      {error ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {isFormOpen ? (
        <form className="panel grid gap-4 p-5" onSubmit={handleSubmit}>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink-900">
              {editingProperty ? 'Edit property' : 'Add property'}
            </h2>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="text-sm font-semibold text-ink-500 hover:text-ink-900"
            >
              Cancel
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="Client"
              name="clientId"
              value={form.clientId}
              onChange={handleChange}
              required
            >
              <option value="">Select client</option>
              {clientOptions.map((client) => (
                <option key={client.value} value={client.value}>
                  {client.label}
                </option>
              ))}
            </Select>
            <FormInput
              label="Property name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <FormInput
              label="Address line 1"
              name="addressLine1"
              value={form.addressLine1}
              onChange={handleChange}
              required
            />
            <FormInput
              label="Address line 2"
              name="addressLine2"
              value={form.addressLine2}
              onChange={handleChange}
            />
            <FormInput
              label="City"
              name="city"
              value={form.city}
              onChange={handleChange}
              required
            />
            <FormInput
              label="Postcode"
              name="postcode"
              value={form.postcode}
              onChange={handleChange}
              required
            />
          </div>
          <Textarea
            label="Access notes"
            name="accessNotes"
            value={form.accessNotes}
            onChange={handleChange}
          />
          <div>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-md bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-900 disabled:bg-ink-300"
            >
              {isSaving ? 'Saving...' : 'Save property'}
            </button>
          </div>
        </form>
      ) : null}

      <DataTable
        columns={columns}
        rows={properties}
        getRowKey={(property) => property.id}
        isLoading={isLoading}
        emptyState={
          <EmptyState
            title="No properties found"
            description="Add properties so jobs can be linked to real client sites."
          />
        }
      />

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete property"
        description={`Delete ${deleteTarget?.name}? Properties with linked jobs cannot be deleted.`}
        confirmLabel="Delete property"
        isWorking={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default AdminPropertiesPage;
