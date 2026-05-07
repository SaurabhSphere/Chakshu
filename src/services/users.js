import api from './api';

export const usersService = {
  getById: async (userId) => {
    const response = await api.get(`/api/users/${userId}`);
    return response.data.data;
  },
  
  list: async (params = {}) => {
    const response = await api.get('/api/users', { params });
    return response.data.data;
  },
  
  update: async (userId, userData) => {
    const response = await api.put(`/api/users/${userId}`, userData);
    return response.data.data;
  },
  
  delete: async (userId) => {
    const response = await api.delete(`/api/users/${userId}`);
    return response.data.data;
  }
};
