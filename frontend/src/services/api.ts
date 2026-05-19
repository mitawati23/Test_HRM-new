import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.replace('/login');
      }
    }
    return Promise.reject(error);
  },
);

export const authService = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),

  me: () => apiClient.get('/auth/me'),

  register: (data: Record<string, unknown>) =>
    apiClient.post('/auth/register', data),
};

export const employeeService = {
  getAll: () => apiClient.get('/employees'),

  getById: (id: string) => apiClient.get(`/employees/${id}`),

  create: (data: Record<string, unknown>) => apiClient.post('/employees', data),

  update: (id: string, data: Record<string, unknown>) =>
    apiClient.put(`/employees/${id}`, data),

  delete: (id: string) => apiClient.delete(`/employees/${id}`),
};

export const attendanceService = {
  markAttendance: (formData: FormData) =>
    apiClient.post('/attendance/mark', formData),

  getMyHistory: (startDate?: string, endDate?: string) =>
    apiClient.get('/attendance/my-history', {
      params: { startDate, endDate },
    }),

  getEmployeeAttendance: (employeeId: string) =>
    apiClient.get(`/attendance/employee/${employeeId}`),

  getAll: () => apiClient.get('/attendance'),

  getById: (id: string) => apiClient.get(`/attendance/${id}`),
};

export default apiClient;
