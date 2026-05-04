import { apiClient } from './apiClient.js';

export const reportApi = {
  getJobReport: async (jobId) => {
    const response = await apiClient.get(`/reports/jobs/${jobId}`);
    return response.data.report;
  }
};
