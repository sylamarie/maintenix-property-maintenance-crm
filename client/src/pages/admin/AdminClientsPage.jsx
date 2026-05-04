import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

import { adminApi } from '../../api/adminApi.js';
import ConfirmModal from '../../components/ui/ConfirmModal.jsx';
import DataTable from '../../components/ui/DataTable.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import FormInput from '../../components/ui/FormInput.jsx';
import PageHeader from '../../components/ui/PageHeader.jsx';
import SearchInput from '../../components/ui/SearchInput.jsx';
import Textarea from '../../components/ui/Textarea.jsx';

const blankForm = {
  name: '',
  contactName: '',
  email: '',
  phone: '',
  billingAddress: ''
};

const AdminClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(blankForm);
  const [editingClient, setEditingClient] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  const loadClients = async () => {
    setIsLoading(true);
    setError('');

    try {
      setClients(await adminApi.getClients({ search }));
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || 'Unable to load clients.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [search]);

  const openCreateForm = () => {
    setEditingClient(null);
    setForm(blankForm);
    setIsFormOpen(true);
    setError('');
  };

  const openEditForm = (client) => {
    setEditingClient(client);
    setForm({
      name: client.name || '',
      contactName: client.contactName || '',
      email: client.email || '',
      phone: client.phone || '',
      billingAddress: client.billingAddress || ''
    });
    setIsFormOpen(true);
    setError('');
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      if (editingClient) {
        await adminApi.updateClient(editingClient.id, form);
      } else {
        await adminApi.createClient(form);
      }

      setIsFormOpen(false);
      setEditingClient(null);
      setForm(blankForm);
      await loadClients();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || 'Unable to save client.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    setError('');

    try {
      await adminApi.deleteClient(deleteTarget.id);
      setDeleteTarget(null);
      await loadClients();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Unable to delete client. Remove linked properties and jobs first.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      key: 'client',
      header: 'Client',
      render: (client) => (
        <div>
          <p className="font-semibold text-ink-900">{client.name}</p>
          <p className="mt-1 text-ink-500">{client.email}</p>
        </div>
      )
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (client) => (
        <div>
          <p className="text-ink-700">{client.contactName}</p>
          <p className="mt-1 text-ink-500">{client.phone || 'No phone'}</p>
        </div>
      )
    },
    {
      key: 'counts',
      header: 'Portfolio',
      render: (client) => (
        <p className="text-ink-700">
          {client.propertyCount} properties / {client.jobCount} jobs
        </p>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (client) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => openEditForm(client)}
            className="rounded-md border border-ink-100 px-3 py-1.5 font-semibold text-ink-700 hover:bg-ink-50"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setDeleteTarget(client)}
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
        title="Clients"
        description="Manage client contacts and billing details for maintenance portfolios."
        action={
          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center gap-2 rounded-md bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-900"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add client
          </button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search clients by name, contact, or email"
        />
        {error ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
            {error}
          </div>
        ) : null}
      </div>

      {isFormOpen ? (
        <form className="panel grid gap-4 p-5" onSubmit={handleSubmit}>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-ink-900">
              {editingClient ? 'Edit client' : 'Add client'}
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
            <FormInput
              label="Client name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <FormInput
              label="Contact name"
              name="contactName"
              value={form.contactName}
              onChange={handleChange}
              required
            />
            <FormInput
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <FormInput
              label="Phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
            />
          </div>
          <Textarea
            label="Billing address"
            name="billingAddress"
            value={form.billingAddress}
            onChange={handleChange}
          />
          <div>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-md bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-900 disabled:bg-ink-300"
            >
              {isSaving ? 'Saving...' : 'Save client'}
            </button>
          </div>
        </form>
      ) : null}

      <DataTable
        columns={columns}
        rows={clients}
        getRowKey={(client) => client.id}
        isLoading={isLoading}
        emptyState={
          <EmptyState
            title="No clients found"
            description="Create a client record to start linking properties and jobs."
          />
        }
      />

      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete client"
        description={`Delete ${deleteTarget?.name}? Clients with linked properties or jobs cannot be deleted.`}
        confirmLabel="Delete client"
        isWorking={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default AdminClientsPage;
