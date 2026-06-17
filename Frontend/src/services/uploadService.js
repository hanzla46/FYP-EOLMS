import api from './api';

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
    if (entityType && entityId) {
      return `/api/v1/uploads/${filename}?entity_type=${entityType}&entity_id=${entityId}`;
    }
    return `/api/v1/uploads/${filename}`;
  },
};

export default uploadService;
