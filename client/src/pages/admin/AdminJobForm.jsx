import { useEffect, useMemo, useState } from 'react';

import { adminApi } from '../../api/adminApi.js';
import ActionButton from '../../components/ui/ActionButton.jsx';
import FormInput from '../../components/ui/FormInput.jsx';
import Select from '../../components/ui/Select.jsx';
import Textarea from '../../components/ui/Textarea.jsx';
import { jobPriorities, jobStatuses } from '../../utils/constants.js';

const blankForm = {
  clientId: '',
  propertyId: '',
  assignedOperativeId: '',
  title: '',
  description: '',
  status: 'pending',
  priority: 'medium',
  scheduledDate: '',
  dueDate: '',
  completionDate: ''
};

const AdminJobForm = ({ job, onCancel, onSaved }) => {
  const [clients, setClients] = useState([]);
  const [properties, setProperties] = useState([]);
  const [operatives, setOperatives] = useState([]);
  const [form, setForm] = useState(blankForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadLookups = async () => {
      setIsLoading(true);
      setError('');

      try {
        const [clientsResult, propertiesResult, operativesResult] =
          await Promise.all([
            adminApi.getClients(),
            adminApi.getProperties(),
            adminApi.getOperatives()
          ]);

        setClients(clientsResult);
        setProperties(propertiesResult);
        setOperatives(operativesResult);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            'Unable to load job form data.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadLookups();
  }, []);

  useEffect(() => {
    if (job) {
      setForm({
        clientId: job.clientId || '',
        propertyId: job.propertyId || '',
        assignedOperativeId: job.assignedOperativeId || '',
        title: job.title || '',
        description: job.description || '',
        status: job.status || 'pending',
        priority: job.priority || 'medium',
        scheduledDate: job.scheduledDate?.slice(0, 10) || '',
        dueDate: job.dueDate?.slice(0, 10) || '',
        completionDate: job.completionDate?.slice(0, 10) || ''
      });
    }
  }, [job]);

  const availableProperties = useMemo(() => {
    if (!form.clientId) {
      return properties;
    }

    return properties.filter((property) => property.clientId === form.clientId);
  }, [form.clientId, properties]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
      ...(name === 'clientId' ? { propertyId: '' } : {})
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      const payload = {
        ...form,
        assignedOperativeId: form.assignedOperativeId || null,
        completionDate: form.status === 'completed' ? form.completionDate : null
      };

      const savedJob = job
        ? await adminApi.updateJob(job.id, payload)
        : await adminApi.createJob(payload);

      onSaved(savedJob);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save job.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="panel p-6 text-sm font-medium text-ink-500">
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-brand-700" />
          Loading job form...
        </div>
      </div>
    );
  }

  return (
    <form className="panel grid gap-5 p-5 sm:p-6" onSubmit={handleSubmit}>
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-ink-900">
          {job ? 'Edit job' : 'Create job'}
        </h2>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-semibold text-ink-500 hover:text-ink-900"
          >
            Cancel
          </button>
        ) : null}
      </div>

      {error ? (
        <div className="alert-error">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Select
          label="Client"
          name="clientId"
          value={form.clientId}
          onChange={handleChange}
          required
        >
          <option value="">Select client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </Select>
        <Select
          label="Property"
          name="propertyId"
          value={form.propertyId}
          onChange={handleChange}
          required
        >
          <option value="">Select property</option>
          {availableProperties.map((property) => (
            <option key={property.id} value={property.id}>
              {property.name} - {property.postcode}
            </option>
          ))}
        </Select>
        <FormInput
          label="Job title"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <Select
          label="Assigned operative"
          name="assignedOperativeId"
          value={form.assignedOperativeId}
          onChange={handleChange}
        >
          <option value="">Unassigned</option>
          {operatives.map((operative) => (
            <option key={operative.id} value={operative.id}>
              {operative.name}
            </option>
          ))}
        </Select>
        <Select
          label="Status"
          name="status"
          value={form.status}
          onChange={handleChange}
        >
          {jobStatuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </Select>
        <Select
          label="Priority"
          name="priority"
          value={form.priority}
          onChange={handleChange}
        >
          {jobPriorities.map((priority) => (
            <option key={priority.value} value={priority.value}>
              {priority.label}
            </option>
          ))}
        </Select>
        <FormInput
          label="Scheduled date"
          name="scheduledDate"
          type="date"
          value={form.scheduledDate}
          onChange={handleChange}
        />
        <FormInput
          label="Due date"
          name="dueDate"
          type="date"
          value={form.dueDate}
          onChange={handleChange}
        />
        {form.status === 'completed' ? (
          <FormInput
            label="Completion date"
            name="completionDate"
            type="date"
            value={form.completionDate}
            onChange={handleChange}
          />
        ) : null}
      </div>

      <Textarea
        label="Description"
        name="description"
        value={form.description}
        onChange={handleChange}
        required
      />

      <div>
        <ActionButton
          type="submit"
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : job ? 'Save changes' : 'Create job'}
        </ActionButton>
      </div>
    </form>
  );
};

export default AdminJobForm;
