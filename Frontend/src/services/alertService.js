import api from './api';

const alertService = {
  list: (params) => api.get('/alerts', { params }),
  unreadCount: () => api.get('/alerts/unread-count'),
  markRead: (id) => api.patch(`/alerts/${id}/read`),
};

export default alertService;
