import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle expired sessions
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if invalid/expired and not already on auth pages
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register') && window.location.pathname !== '/') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

// User Profile Services
export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
};

// Resume Services
export const resumeService = {
  uploadResume: (formData) => api.post('/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getResumes: () => api.get('/resumes'),
  getResumeById: (id) => api.get(`/resumes/${id}`),
  deleteResume: (id) => api.delete(`/resumes/${id}`),
};

// Interview Services
export const interviewService = {
  createInterview: (config) => api.post('/interviews', config),
  getInterviews: () => api.get('/interviews'),
  getInterviewById: (id) => api.get(`/interviews/${id}`),
  submitAnswer: (interviewId, data) => api.post(`/interviews/${interviewId}/answer`, data),
  completeInterview: (interviewId) => api.post(`/interviews/${interviewId}/complete`),
  getInterviewReport: (interviewId) => api.get(`/interviews/${interviewId}/report`),
  deleteInterview: (id) => api.delete(`/interviews/${id}`),
};

// Analytics Services
export const analyticsService = {
  getDashboardAnalytics: () => api.get('/analytics/dashboard'),
};

export default api;
