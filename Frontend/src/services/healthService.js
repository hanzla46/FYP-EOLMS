import api from './api';

const healthService = {
  createRecord: (data) => api.post('/health-records', data),
  list: (params) => api.get('/health-records', { params }),
  getById: (id) => api.get(`/health-records/${id}`),
  getAnimalHistory: (animalId) => api.get(`/animals/${animalId}/health-history`),
};

export default healthService;
