import api from './axios';


export const auth = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  logout: () => api.post('/logout'),
  getUser: () => api.get('/user'),
};


export const dashboard = {
  getStats: () => api.get('/dashboard'),
};


export const projects = {
  getAll: (params) => api.get('/projects', { params }),
  get: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
};


export const tasks = {
  getAll: (projectId, params) => api.get(`/projects/${projectId}/tasks`, { params }),
  get: (projectId, taskId) => api.get(`/projects/${projectId}/tasks/${taskId}`),
  create: (projectId, data) => api.post(`/projects/${projectId}/tasks`, data),
  update: (projectId, taskId, data) => api.put(`/projects/${projectId}/tasks/${taskId}`, data),
  updateStatus: (projectId, taskId, status) => 
    api.patch(`/projects/${projectId}/tasks/${taskId}/status`, { status }),
  delete: (projectId, taskId) => api.delete(`/projects/${projectId}/tasks/${taskId}`),
};


export const members = {
  getAll: (projectId) => api.get(`/projects/${projectId}/members`),
  getList: (projectId) => api.get(`/projects/${projectId}/members/list`),
  add: (projectId, data) => api.post(`/projects/${projectId}/members`, data),
  update: (projectId, memberId, data) => 
    api.put(`/projects/${projectId}/members/${memberId}`, data),
  remove: (projectId, memberId) => 
    api.delete(`/projects/${projectId}/members/${memberId}`),
};


export const users = {
  getAll: () => api.get('/users'),
};
