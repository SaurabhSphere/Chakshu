import api from './api';

export const employersService = {
  create: async (employerData) => {
    const response = await api.post('/api/employers', employerData);
    return response.data.data;
  },

  list: async (params = {}) => {
    const response = await api.get('/api/employers', { params });
    return response.data.data;
  },

  getById: async (employerId) => {
    const response = await api.get(`/api/employers/${employerId}`);
    return response.data.data;
  },

  update: async (employerId, employerData) => {
    const response = await api.put(`/api/employers/${employerId}`, employerData);
    return response.data.data;
  },

  delete: async (employerId) => {
    const response = await api.delete(`/api/employers/${employerId}`);
    return response.data.data;
  }
};
