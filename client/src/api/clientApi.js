import { apiClient } from './apiClient.js';

const buildParams = (params = {}) => {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
  );
};

export const clientApi = {
  getDashboard: async () => {
    const response = await apiClient.get('/client/dashboard');
    return response.data;
  },

  getProperties: async () => {
    const response = await apiClient.get('/client/properties');
    return response.data.properties;
  },

  getJobs: async (params) => {
    const response = await apiClient.get('/client/jobs', {
      params: buildParams(params)
    });
    return response.data.jobs;
  },

  getJob: async (id) => {
    const response = await apiClient.get(`/client/jobs/${id}`);
    return response.data;
  },

  getVariations: async (params) => {
    const response = await apiClient.get('/client/variations', {
      params: buildParams(params)
    });
    return response.data.variations;
  },

  decideVariation: async (id, payload) => {
    const response = await apiClient.patch(
      `/variations/${id}/client-decision`,
      payload
    );
    return response.data.variation;
  }
};
