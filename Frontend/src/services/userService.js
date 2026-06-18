import api from './api';

const userService = {
  list: (params) => api.get('/auth/users', { params }),
  update: (id, data) => api.put(`/auth/users/${id}`, data),
  toggleStatus: (id) => api.patch(`/auth/users/${id}/status`),
};

export default userService;
