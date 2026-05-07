import api from './api';

export const resumesService = {
  uploadResume: async (candidateId, resumeData) => {
    const response = await api.post(`/api/candidates/${candidateId}/resumes`, resumeData);
    return response.data.data;
  },

  listForCandidate: async (candidateId, params = {}) => {
    const response = await api.get(`/api/candidates/${candidateId}/resumes`, { params });
    return response.data.data;
  },

  getById: async (resumeId) => {
    const response = await api.get(`/api/resumes/${resumeId}`);
    return response.data.data;
  },

  delete: async (resumeId) => {
    const response = await api.delete(`/api/resumes/${resumeId}`);
    return response.data.data;
  },

  parseResume: async (resumeId) => {
    const response = await api.post(`/api/resumes/${resumeId}/parse`);
    return response.data.data;
  },

  saveExtractedData: async (resumeId, extractedData) => {
    const response = await api.post(`/api/resumes/${resumeId}/extracted-data`, extractedData);
    return response.data.data;
  },

  getExtractedData: async (resumeId) => {
    const response = await api.get(`/api/resumes/${resumeId}/extracted-data`);
    return response.data.data;
  }
};
