import { apiClient } from './apiClient.js';

const buildParams = (params = {}) => {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
  );
};

export const getUploadUrl = (fileUrl) => {
  if (!fileUrl) {
    return '';
  }

  if (/^https?:\/\//i.test(fileUrl)) {
    return fileUrl;
  }

  const normalizedPath = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
  const apiRoot = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api')
    .replace(/\/api(?:\/.*)?$/, '')
    .replace(/\/$/, '');

  return `${apiRoot}${normalizedPath}`;
};

export const operativeApi = {
  getDashboard: async () => {
    const response = await apiClient.get('/operative/dashboard');
    return response.data;
  },

  getJobs: async (params) => {
    const response = await apiClient.get('/operative/jobs', {
      params: buildParams(params)
    });
    return response.data.jobs;
  },

  getJob: async (id) => {
    const response = await apiClient.get(`/operative/jobs/${id}`);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await apiClient.patch(`/operative/jobs/${id}/status`, {
      status
    });
    return response.data.job;
  },

  getNotes: async (jobId) => {
    const response = await apiClient.get(`/job-notes/job/${jobId}`);
    return response.data.notes;
  },

  addNote: async ({ jobId, note }) => {
    const response = await apiClient.post('/job-notes', {
      jobId,
      note
    });
    return response.data.note;
  },

  uploadPhoto: async ({ jobId, photoType, caption, file }) => {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('photoType', photoType);
    formData.append('caption', caption || '');

    const response = await apiClient.post(`/uploads/jobs/${jobId}/photos`, formData);

    return response.data.photo;
  },

  getJobVariations: async (jobId) => {
    const response = await apiClient.get(`/operative/jobs/${jobId}/variations`);
    return response.data.variations;
  },

  createVariation: async ({ jobId, description, reason, estimatedAmount, file }) => {
    const formData = new FormData();
    formData.append('jobId', jobId);
    formData.append('description', description);
    formData.append('reason', reason);
    formData.append('estimatedAmount', estimatedAmount || '');

    if (file) {
      formData.append('photo', file);
    }

    const response = await apiClient.post('/variations', formData);

    return response.data.variation;
  }
};
