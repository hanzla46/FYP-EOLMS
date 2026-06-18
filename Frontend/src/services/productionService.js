import api from './api';

const productionService = {
  log: (data) => api.post('/production-logs', data),
  list: (params) => api.get('/production-logs', { params }),
  dashboard: (params) => api.get('/production-logs/dashboard', { params }),
  animalStats: (animalId) => api.get(`/animals/${animalId}/production-stats`),
};

export default productionService;
