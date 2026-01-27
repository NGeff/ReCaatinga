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
  delete: (id) => api.delete(`/users/${id}`),
};

export const phaseAPI = {
  getAll: () => api.get('/phases'),
  getById: (id) => api.get(`/phases/${id}`),
  create: (data) => api.post('/phases', data),
  update: (id, data) => api.put(`/phases/${id}`, data),
  delete: (id) => api.delete(`/phases/${id}`),
  getPhaseBadges: (userId) => api.get(userId ? `/phases/badges/${userId}` : '/phases/badges'),
};

export const missionAPI = {
  getAll: () => api.get('/missions'),
  getById: (id) => api.get(`/missions/${id}`),
  getByPhase: (phaseId) => api.get(`/missions/phase/${phaseId}`),
  create: (data) => api.post('/missions', data),
  update: (id, data) => api.put(`/missions/${id}`, data),
  delete: (id) => api.delete(`/missions/${id}`),
  updateOrder: (phaseId, missions) => api.put(`/missions/phase/${phaseId}/order`, { missions }),
};

export const gameAPI = {
  getAll: () => api.get('/games'),
  getById: (id) => api.get(`/games/${id}`),
  getByMission: (missionId) => api.get(`/games/mission/${missionId}`),
  create: (data) => api.post('/games', data),
  update: (id, data) => api.put(`/games/${id}`, data),
  delete: (id) => api.delete(`/games/${id}`),
  submitScore: (gameId, score) => api.post(`/games/${gameId}/submit`, { score }),
};

export const progressAPI = {
  getUserProgress: () => api.get('/progress'),
  getPhaseProgress: (phaseId) => api.get(`/progress/phase/${phaseId}`),
  getMissionProgress: (missionId) => api.get(`/progress/mission/${missionId}`),
  updateProgress: (data) => api.post('/progress', data),
  completeGame: (gameId, data) => api.post(`/progress/game/${gameId}/complete`, data),
  getOverall: () => api.get('/progress/overall'),
  markVideoWatched: (phaseId) => api.post(`/progress/phase/${phaseId}/video`),
  completeMission: (missionId, data) => api.post(`/progress/mission/${missionId}/complete`, data),
  setActiveBadge: (data) => api.post('/progress/badge', data),
};

export const rankingAPI = {
  getGlobalRanking: (limit = 10) => api.get(`/ranking?limit=${limit}`),
  getTop: (limit = 10) => api.get(`/ranking?limit=${limit}`),
  getUserRank: () => api.get('/ranking/me'),
  getPhaseRanking: (phaseId, limit = 10) => api.get(`/ranking/phase/${phaseId}?limit=${limit}`),
};

export const achievementAPI = {
  getAll: () => api.get('/achievements'),
  getUserAchievements: () => api.get('/achievements/user'),
  create: (data) => api.post('/achievements', data),
  update: (id, data) => api.put(`/achievements/${id}`, data),
  delete: (id) => api.delete(`/achievements/${id}`),
};

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getUserStats: () => api.get('/analytics/user/stats'),
  getPhaseStats: (phaseId) => api.get(`/analytics/phase/${phaseId}`),
};

export const taskAPI = {
  submit: (missionId, data) => api.post(`/tasks/submit/${missionId}`, data),
  getSubmissions: () => api.get('/tasks/submissions'),
  getMySubmissions: () => api.get('/tasks/my-submissions'),
  getMissionSubmissions: (missionId) => api.get(`/tasks/submissions/mission/${missionId}`),
  getPendingReviews: () => api.get('/tasks/pending'),
  review: (submissionId, data) => api.put(`/tasks/review/${submissionId}`, data),
};

export const puzzleAPI = {
  generate: (imageUrl, pieces) => api.post('/puzzle/generate', { imageUrl, pieces }),
};

export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  registerDevice: (data) => api.post('/notifications/register-device', data),
};

export default api;