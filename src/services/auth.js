import api from './api';

export const authService = {
  register: async (data) => {
    const response = await api.post('/api/auth/register', data);
    return response.data.data;
  },

  login: async (email, password) => {
    const response = await api.post('/api/auth/login', {
      email,
      password,
    });
    return {
      user: response.data.data.user,
      token: response.data.data.access_token,
    };
  },

  logout: () => {
    localStorage.removeItem('auth_token');
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/api/users/me');
      return response.data.data;
    } catch (error) {
      throw error;
    }
  },
};
