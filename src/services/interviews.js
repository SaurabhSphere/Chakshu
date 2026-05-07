import api from './api';

export const interviewsService = {
  // Interview Sessions
  createSession: async (sessionData) => {
    const response = await api.post('/api/interview-sessions', sessionData);
    return response.data.data;
  },

  getSession: async (sessionId) => {
    const response = await api.get(`/api/interview-sessions/${sessionId}`);
    return response.data.data;
  },

  startSession: async (sessionId) => {
    const response = await api.patch(`/api/interview-sessions/${sessionId}/start`);
    return response.data.data;
  },

  endSession: async (sessionId) => {
    const response = await api.patch(`/api/interview-sessions/${sessionId}/end`);
    return response.data.data;
  },

  updateSession: async (sessionId, sessionData) => {
    const response = await api.put(`/api/interview-sessions/${sessionId}`, sessionData);
    return response.data.data;
  },

  // Interview Questions
  addQuestion: async (sessionId, questionData) => {
    const response = await api.post(`/api/interview-sessions/${sessionId}/questions`, questionData);
    return response.data.data;
  },

  getQuestions: async (sessionId, params = {}) => {
    const response = await api.get(`/api/interview-sessions/${sessionId}/questions`, { params });
    return response.data.data;
  },

  // Interview Answers
  submitAnswer: async (questionId, answerData) => {
    const response = await api.post(`/api/interview-questions/${questionId}/answers`, answerData);
    return response.data.data;
  },

  updateAnswer: async (answerId, answerData) => {
    const response = await api.put(`/api/interview-answers/${answerId}`, answerData);
    return response.data.data;
  },

  // Reports
  generateReport: async (sessionId, reportData) => {
    const response = await api.post(`/api/interview-sessions/${sessionId}/generate-report`, reportData);
    return response.data.data;
  },

  getReport: async (sessionId) => {
    const response = await api.get(`/api/interview-sessions/${sessionId}/report`);
    return response.data.data;
  },
};
