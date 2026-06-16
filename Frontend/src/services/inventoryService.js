import api from './api';

const inventoryService = {
  addItem: (data) => api.post('/inventory', data),
  list: (params) => api.get('/inventory', { params }),
  getById: (id) => api.get(`/inventory/${id}`),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  adjustStock: (id, adjustment, note) => api.patch(`/inventory/${id}/stock`, { adjustment, note }),
};

export default inventoryService;
