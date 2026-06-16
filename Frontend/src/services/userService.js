import api from './api';

const userService = {
  list: (params) => api.get('/auth/users', { params }),
};

export default userService;
