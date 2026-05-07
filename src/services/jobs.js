import api from './api';

export const jobsService = {
  create: async (jobData) => {
    const response = await api.post('/api/jobs', jobData);
    return response.data.data;
  },

  list: async (params = {}) => {
    const response = await api.get('/api/jobs', { params });
    return response.data.data;
  },

  getById: async (jobId) => {
    const response = await api.get(`/api/jobs/${jobId}`);
    return response.data.data;
  },

  getApplications: async (jobId, params = {}) => {
    const response = await api.get(`/api/jobs/${jobId}/applications`, { params });
    return response.data.data;
  },

  updateStatus: async (jobId, status) => {
    const response = await api.patch(`/api/jobs/${jobId}/status`, { status });
    return response.data.data;
  },

  update: async (jobId, jobData) => {
    const response = await api.put(`/api/jobs/${jobId}`, jobData);
    return response.data.data;
  },

  delete: async (jobId) => {
    const response = await api.delete(`/api/jobs/${jobId}`);
    return response.data.data;
  },
};
