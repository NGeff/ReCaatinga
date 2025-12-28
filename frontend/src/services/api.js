import axios from 'axios';

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

export const phaseAPI = {
  getAll: () => api.get('/phases'),
  getById: (id) => api.get(`/phases/${id}`),
  create: (data) => api.post('/phases', data),
  update: (id, data) => api.put(`/phases/${id}`, data),
  delete: (id) => api.delete(`/phases/${id}`),
  getPhaseBadges: (userId) => api.get(userId ? `/phases/badges/${userId}` : '/phases/badges'),
};

export const missionAPI = {
  getByPhase: (phaseId) => api.get(`/missions/phase/${phaseId}`),
  getById: (id) => api.get(`/missions/${id}`),
  create: (data) => api.post('/missions', data),
  update: (id, data) => api.put(`/missions/${id}`, data),
  delete: (id) => api.delete(`/missions/${id}`),
  completeVideo: (id) => api.post(`/progress/mission/${id}`, { score: 100 }),
};

export const gameAPI = {
  getByPhase: (phaseId) => api.get(`/games/phase/${phaseId}`),
  getByMission: (missionId) => api.get(`/games/mission/${missionId}`),
  getById: (id) => api.get(`/games/${id}`),
  create: (data) => api.post('/games', data),
  update: (id, data) => api.put(`/games/${id}`, data),
  delete: (id) => api.delete(`/games/${id}`),
  submitScore: (gameId, score) => api.post(`/games/${gameId}/submit`, { score }),
};

export const taskAPI = {
  submit: (data) => api.post('/tasks/submit', data, {
    headers: { 'Content-Type': 'application/json' }
  }),
  getPending: () => api.get('/tasks/pending'),
  getMySubmissions: () => api.get('/tasks/my-submissions'),
  review: (submissionId, data) => api.put(`/tasks/review/${submissionId}`, data),
};

export const progressAPI = {
  getUser: () => api.get('/progress'),
  getPhase: (phaseId) => api.get(`/progress/phase/${phaseId}`),
  getOverall: () => api.get('/progress/overall'),
  markVideoWatched: (phaseId) => api.post(`/progress/video/${phaseId}`),
  completeMission: (missionId, score) => api.post(`/progress/mission/${missionId}`, { score }),
  setActiveBadge: (badgeId) => api.put('/progress/active-badge', { badgeId }),
};

export const rankingAPI = {
  getTop: (limit = 10) => api.get(`/ranking/top?limit=${limit}`),
  getUserRank: (userId) => api.get(`/ranking/position/${userId || ''}`),
};

export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
};

export const achievementAPI = {
  getAll: () => api.get('/achievements'),
  getUserAchievements: () => api.get('/achievements/user'),
  getUserStats: (userId) => api.get(userId ? `/achievements/user/stats/${userId}` : '/achievements/user/stats'),
  create: (data) => api.post('/achievements', data),
  update: (id, data) => api.put(`/achievements/${id}`, data),
  delete: (id) => api.delete(`/achievements/${id}`),
};

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
};

export const notificationAPI = {
  registerDevice: (data) => api.post('/notifications/register-device', data),
  sendToAll: (data) => api.post('/notifications/send-all', data),
  sendToUser: (userId, data) => api.post(`/notifications/send-user/${userId}`, data),
  getHistory: () => api.get('/notifications/history'),
};

export default api;
