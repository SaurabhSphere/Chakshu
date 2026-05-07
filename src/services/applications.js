import api from './api';

export const applicationsService = {
  create: async (applicationData) => {
    const response = await api.post('/api/applications', applicationData);
    return response.data.data;
  },

  list: async (params = {}) => {
    const response = await api.get('/api/applications', { params });
    return response.data.data;
  },

  getById: async (applicationId) => {
    const response = await api.get(`/api/applications/${applicationId}`);
    return response.data.data;
  },

  updateStatus: async (applicationId, newStatus) => {
    const response = await api.patch(`/api/applications/${applicationId}/status`, {
      new_status: newStatus,
    });
    return response.data.data;
  },

  update: async (applicationId, applicationData) => {
    const response = await api.put(`/api/applications/${applicationId}`, applicationData);
    return response.data.data;
  },

  delete: async (applicationId) => {
    const response = await api.delete(`/api/applications/${applicationId}`);
    return response.data.data;
  },

  getByJob: async (jobId, params = {}) => {
    const response = await api.get(`/api/applications/job/${jobId}`, { params });
    return response.data.data;
  },

  getByCandidate: async (candidateId, params = {}) => {
    const response = await api.get(`/api/applications/candidate/${candidateId}`, { params });
    return response.data.data;
  },
};
