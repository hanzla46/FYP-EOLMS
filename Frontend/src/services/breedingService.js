import api from './api';

const breedingService = {
  logInsemination: (data) => api.post('/breeding-records', data),
  list: (params) => api.get('/breeding-records', { params }),
  pregnancyCheck: (id, data) => api.patch(`/breeding-records/${id}/pregnancy-check`, data),
  getAnimalHistory: (animalId) => api.get(`/animals/${animalId}/breeding-history`),
};

export default breedingService;
