import axios from 'axios';


const getApiUrl = () => {

  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('standtrack_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('standtrack_token');
      localStorage.removeItem('standtrack_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

// Entries API
export const entriesAPI = {
  getAll: (params?: { page?: number; limit?: number; startDate?: string; endDate?: string }) =>
    api.get('/entries', { params }),
  getToday: () => api.get('/entries/today'),
  getByDate: (date: string) => api.get(`/entries/date/${date}`),
  getById: (id: string) => api.get(`/entries/${id}`),
  create: (data: {
    date: string;
    tasks?: string;
    nextTasks?: string;
    blockers?: string;
    questions?: string;
    notes?: string;
  }) => api.post('/entries', data),
  update: (id: string, data: {
    tasks?: string;
    nextTasks?: string;
    blockers?: string;
    questions?: string;
    notes?: string;
  }) => api.put(`/entries/${id}`, data),
  delete: (id: string) => api.delete(`/entries/${id}`),
};

export const settingsAPI = {
  // Get all settings
  getSettings: () => api.get('/settings'),

  // Meeting time
  updateMeetingTime: (defaultMeetingTime: string) =>
    api.put('/settings/meeting-time', { defaultMeetingTime }),
  getMeetingTimeForDate: (date: string) =>
    api.get(`/settings/meeting-time/${date}`),

  // Meeting overrides
  setMeetingOverride: (date: string, meetingTime: string) =>
    api.post('/settings/meeting-override', { date, meetingTime }),
  getMeetingOverrides: () =>
    api.get('/settings/meeting-overrides'),
  deleteMeetingOverride: (date: string) =>
    api.delete(`/settings/meeting-override/${date}`),

  // Reminders
  updateReminders: (data: { enabled: boolean; email?: string; times?: string[]; timezone?: string }) =>
    api.put('/settings/reminders', data),
};

export default api;
