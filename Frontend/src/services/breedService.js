import api from './api';

const breedService = {
  list: (species) => api.get('/animals/breeds', { params: species ? { species } : {} }),
};

export default breedService;
