import api from './api';

export const reportsService = {
  getSessionReport: async (sessionId) => {
    const response = await api.get(`/api/interview-sessions/${sessionId}/report`);
    return response.data.data;
  },

  listReports: async (params = {}) => {
    const response = await api.get('/api/interview-sessions', { params });
    return response.data.data;
  },

  getReportByJobId: async (jobId, params = {}) => {
    const response = await api.get('/api/interview-sessions', {
      params: { ...params, job_id: jobId },
    });
    return response.data.data;
  },

  getReportByCandidateId: async (candidateId, params = {}) => {
    const response = await api.get('/api/interview-sessions', {
      params: { ...params, candidate_id: candidateId },
    });
    return response.data.data;
  },
};
