import api from './api';

const financeService = {
  createTransaction: (data) => api.post('/finance/transactions', data),
  list: (params) => api.get('/finance/transactions', { params }),
  summary: (params) => api.get('/finance/summary', { params }),
  animalFinancials: (animalId) => api.get(`/animals/${animalId}/financials`),
};

export default financeService;
