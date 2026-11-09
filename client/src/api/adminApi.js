import { apiClient } from './apiClient.js';

const buildParams = (params = {}) => {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
  );
};

export const adminApi = {
  getDashboard: async () => {
    const response = await apiClient.get('/admin/dashboard');
    return response.data;
  },

  getClients: async (params) => {
    const response = await apiClient.get('/clients', {
      params: buildParams(params)
    });
    return response.data.clients;
  },

  createClient: async (payload) => {
    const response = await apiClient.post('/clients', payload);
    return response.data.client;
  },

  updateClient: async (id, payload) => {
    const response = await apiClient.patch(`/clients/${id}`, payload);
    return response.data.client;
  },

  deleteClient: async (id) => {
    await apiClient.delete(`/clients/${id}`);
  },

  getProperties: async (params) => {
    const response = await apiClient.get('/properties', {
      params: buildParams(params)
    });
    return response.data.properties;
  },

  createProperty: async (payload) => {
    const response = await apiClient.post('/properties', payload);
    return response.data.property;
  },

  updateProperty: async (id, payload) => {
    const response = await apiClient.patch(`/properties/${id}`, payload);
    return response.data.property;
  },

  deleteProperty: async (id) => {
    await apiClient.delete(`/properties/${id}`);
  },

  getJobs: async (params) => {
    const response = await apiClient.get('/jobs', {
      params: buildParams(params)
    });
    return response.data.jobs;
  },

  // Paginated version: returns { jobs, pagination } so the page can show
  // "Page 2 of 7". Pass `page` and `limit` in params.
  getJobsPage: async (params) => {
    const response = await apiClient.get('/jobs', {
      params: buildParams(params)
    });
    return { jobs: response.data.jobs, pagination: response.data.pagination };
  },

  getJob: async (id) => {
    const response = await apiClient.get(`/jobs/${id}`);
    return response.data.job;
  },

  createJob: async (payload) => {
    const response = await apiClient.post('/jobs', payload);
    return response.data.job;
  },

  updateJob: async (id, payload) => {
    const response = await apiClient.patch(`/jobs/${id}`, payload);
    return response.data.job;
  },

  updateJobStatus: async (id, status) => {
    const response = await apiClient.patch(`/jobs/${id}/status`, { status });
    return response.data.job;
  },

  assignJob: async (id, assignedOperativeId) => {
    const response = await apiClient.patch(`/jobs/${id}/assign`, {
      assignedOperativeId
    });
    return response.data.job;
  },

  deleteJob: async (id) => {
    await apiClient.delete(`/jobs/${id}`);
  },

  getOperatives: async () => {
    const response = await apiClient.get('/users/operatives');
    return response.data.operatives;
  },

  getVariations: async (params) => {
    const response = await apiClient.get('/variations', {
      params: buildParams(params)
    });
    return response.data.variations;
  },

  getVariation: async (id) => {
    const response = await apiClient.get(`/variations/${id}`);
    return response.data.variation;
  },

  reviewVariation: async (id, payload) => {
    const response = await apiClient.patch(
      `/variations/${id}/admin-review`,
      payload
    );
    return response.data.variation;
  }
};
