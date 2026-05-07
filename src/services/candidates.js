import api from './api';

export const candidatesService = {
  register: async (candidateData) => {
    const response = await api.post('/api/candidates', candidateData);
    return response.data.data;
  },

  list: async (params = {}) => {
    const response = await api.get('/api/candidates', { params });
    return response.data.data;
  },

  getById: async (candidateId) => {
    const response = await api.get(`/api/candidates/${candidateId}`);
    return response.data.data;
  },

  getApplications: async (candidateId, params = {}) => {
    const response = await api.get(`/api/candidates/${candidateId}/applications`, { params });
    return response.data.data;
  },

  update: async (candidateId, candidateData) => {
    const response = await api.put(`/api/candidates/${candidateId}`, candidateData);
    return response.data.data;
  },
};
