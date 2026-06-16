import api from './api';

const productionService = {
  log: (data) => api.post('/production-logs', data),
  list: (params) => api.get('/production-logs', { params }),
  dashboard: () => api.get('/production-logs/dashboard'),
  animalStats: (animalId) => api.get(`/animals/${animalId}/production-stats`),
};

export default productionService;
