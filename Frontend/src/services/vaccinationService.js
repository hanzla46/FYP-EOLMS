import api from './api';

const vaccinationService = {
  create: (data) => api.post('/vaccination-schedules', data),
  list: (params) => api.get('/vaccination-schedules', { params }),
};

export default vaccinationService;
