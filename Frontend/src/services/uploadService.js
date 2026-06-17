import api from './api';

const BASE = 'https://eolms-backend.vercel.app/api/v1';

const uploadService = {
  uploadAnimalPhoto: (animalId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/uploads/animal/${animalId}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadHealthDocument: (recordId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/uploads/health-record/${recordId}/document`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getFileUrl: (filename, entityType, entityId) => {
    const params = entityType && entityId ? `?entity_type=${entityType}&entity_id=${entityId}` : '';
    return `${BASE}/uploads/${filename}${params}`;
  },
};

export default uploadService;
