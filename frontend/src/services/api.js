import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { default: useAuthStore } = await import('../store/authStore');
        const refreshed = await useAuthStore.getState().refreshAccessToken();
        if (refreshed) return api(original);
      } catch (_) {}
    }
    return Promise.reject(error);
  }
);

export const interviewsAPI = {
  schedule: (data) => api.post('/interviews', data),
  getAll: (params) => api.get('/interviews', { params }),
  getOne: (id) => api.get(`/interviews/${id}`),
  getUpcoming: () => api.get('/interviews/upcoming'),
  update: (id, data) => api.patch(`/interviews/${id}`, data),
  cancel: (id, reason) => api.patch(`/interviews/${id}/cancel`, { reason }),
  reschedule: (id, data) => api.post(`/interviews/${id}/reschedule`, data),
  updateMeetingLink: (id, meetingLink) => api.patch(`/interviews/${id}/meeting-link`, { meetingLink }),
};

export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getOne: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  toggleStatus: (id) => api.patch(`/users/${id}/toggle-status`),
};

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getTrends: (params) => api.get('/analytics/trends', { params }),
  getFunnel: (params) => api.get('/analytics/funnel', { params }),
  getInterviewerPerformance: () => api.get('/analytics/interviewer-performance'),
  getFeedbackStats: () => api.get('/analytics/feedback'),
};

export const feedbackAPI = {
  submit: (interviewId, data) => api.post(`/feedback/interview/${interviewId}`, data),
  get: (interviewId) => api.get(`/feedback/interview/${interviewId}`),
  getMine: () => api.get('/feedback/mine'),
  update: (id, data) => api.put(`/feedback/${id}`, data),
};

export const calendarAPI = {
  getGoogleAuthUrl: () => api.get('/calendar/google/auth-url'),
  disconnect: (provider) => api.delete(`/calendar/disconnect/${provider}`),
  getAvailability: (params) => api.get('/calendar/availability', { params }),
  getStatus: () => api.get('/calendar/status'),
};

export const companiesAPI = {
  getWorkspace: () => api.get('/companies/workspace'),
  create: (data) => api.post('/companies', data),
  getAll: (params) => api.get('/companies', { params }),
  getOne: (id) => api.get(`/companies/${id}`),
  updateSpaceCode: (id, spaceCode) => api.patch(`/companies/${id}/space-code`, { spaceCode }),
  delete: (id) => api.delete(`/companies/${id}`),
};

export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export default api;
