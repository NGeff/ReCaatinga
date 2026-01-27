import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = 'https://recaatinga.com.br/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      const isLoginPage = window.location.pathname === '/login';
      const isRegisterPage = window.location.pathname === '/register';
      const isVerifyPage = window.location.pathname === '/verify';
      const isForgotPasswordPage = window.location.pathname === '/forgot-password';
      const isResetPasswordPage = window.location.pathname.startsWith('/reset-password');

      if (!isLoginPage && !isRegisterPage && !isVerifyPage && !isForgotPasswordPage && !isResetPasswordPage) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        
        toast.error('Sessão expirada. Faça login novamente.', {
          position: 'top-center',
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        setTimeout(() => {
          window.location.href = '/login';
        }, 500);
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  verify: (data) => api.post('/auth/verify', data),
  resendCode: (data) => api.post('/auth/resend-code', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  updatePassword: (data) => api.put('/auth/password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
};

export const uploadAPI = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadDocument: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/document', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadAudio: (file) => {
    const formData = new FormData();
    formData.append('audio', file);
    return api.post('/upload/audio', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
};

export const phaseAPI = {
  getAll: () => api.get('/phases'),
  getById: (id) => api.get(`/phases/${id}`),
  create: (data) => api.post('/phases', data),
  update: (id, data) => api.put(`/phases/${id}`, data),
  delete: (id) => api.delete(`/phases/${id}`),
};

export const missionAPI = {
  getAll: () => api.get('/missions'),
  getById: (id) => api.get(`/missions/${id}`),
  getByPhase: (phaseId) => api.get(`/missions/phase/${phaseId}`),
  create: (data) => api.post('/missions', data),
  update: (id, data) => api.put(`/missions/${id}`, data),
  delete: (id) => api.delete(`/missions/${id}`),
};

export const gameAPI = {
  getAll: () => api.get('/games'),
  getById: (id) => api.get(`/games/${id}`),
  getByMission: (missionId) => api.get(`/games/mission/${missionId}`),
  getByPhase: (phaseId) => api.get(`/games/phase/${phaseId}`),
  create: (data) => api.post('/games', data),
  update: (id, data) => api.put(`/games/${id}`, data),
  delete: (id) => api.delete(`/games/${id}`),
  submitScore: (gameId, score) => api.post(`/games/${gameId}/submit`, { score }),
};

export const progressAPI = {
  getUserProgress: () => api.get('/progress'),
  getPhaseProgress: (phaseId) => api.get(`/progress/phase/${phaseId}`),
  getPhase: (phaseId) => api.get(`/progress/phase/${phaseId}`),
  getOverall: () => api.get('/progress/overall'),
  markVideoWatched: (phaseId) => api.post(`/progress/video/${phaseId}`),
  completeMission: (missionId, data) => api.post(`/progress/mission/${missionId}`, data),
};

export const rankingAPI = {
  getTop: (limit = 10) => api.get(`/ranking/top?limit=${limit}`),
  getUserRank: (userId) => api.get(`/ranking/position/${userId || ''}`),
};

export const achievementAPI = {
  getAll: () => api.get('/achievements'),
  getUserAchievements: () => api.get('/achievements/user'),
  create: (data) => api.post('/achievements', data),
  delete: (id) => api.delete(`/achievements/${id}`),
};

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
};

export const taskAPI = {
  submit: (data) => {
    const formData = new FormData();
    if (data.photo) formData.append('photo', data.photo);
    if (data.missionId) formData.append('missionId', data.missionId);
    if (data.phaseId) formData.append('phaseId', data.phaseId);
    if (data.location) formData.append('location', JSON.stringify(data.location));
    if (data.description) formData.append('description', data.description);
    return api.post('/tasks/submit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getPendingReviews: () => api.get('/tasks/pending'),
  getMySubmissions: () => api.get('/tasks/my-submissions'),
  review: (submissionId, data) => api.put(`/tasks/review/${submissionId}`, data),
};

export const puzzleAPI = {
  process: (params) => api.get('/puzzle/process', { params }),
};

export const notificationAPI = {
  registerDevice: (data) => api.post('/notifications/register-device', data),
  sendToAll: (data) => api.post('/notifications/send-all', data),
  sendToUser: (userId, data) => api.post(`/notifications/send-user/${userId}`, data),
  getHistory: () => api.get('/notifications/history'),
  removeDevice: () => api.delete('/notifications/remove-device'),
};

export default api;