import api from './api';

const animalService = {
  register: (data) => api.post('/animals', data),
  list: (params) => api.get('/animals', { params }),
  getById: (id) => api.get(`/animals/${id}`),
  update: (id, data) => api.put(`/animals/${id}`, data),
  updateStatus: (id, status) => api.patch(`/animals/${id}/status`, { status }),
};

export default animalService;
