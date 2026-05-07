import api from './api';

export const reportsService = {
  // Reports
  generateReport: async (sessionId, reportData) => {
    const response = await api.post(`/api/interview-sessions/${sessionId}/generate-report`, reportData);
    return response.data.data;
  },

  getSessionReport: async (sessionId) => {
    const response = await api.get(`/api/interview-sessions/${sessionId}/report`);
    return response.data.data;
  },

  getReportById: async (reportId) => {
    const response = await api.get(`/api/ai-reports/${reportId}`);
    return response.data.data;
  },

  updateReport: async (reportId, reportData) => {
    const response = await api.put(`/api/ai-reports/${reportId}`, reportData);
    return response.data.data;
  },

  deleteReport: async (reportId) => {
    const response = await api.delete(`/api/ai-reports/${reportId}`);
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

  // Events
  logEvent: async (sessionId, eventData) => {
    const response = await api.post(`/api/interview-sessions/${sessionId}/events`, eventData);
    return response.data.data;
  },

  getSessionEvents: async (sessionId) => {
    const response = await api.get(`/api/interview-sessions/${sessionId}/events`);
    return response.data.data;
  },

  deleteEvent: async (eventId) => {
    const response = await api.delete(`/api/interview-events/${eventId}`);
    return response.data.data;
  },
};
