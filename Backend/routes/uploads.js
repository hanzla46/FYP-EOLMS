const express = require('express');
const router = express.Router();
const { uploadAnimalPhoto, uploadHealthDocument, serveFile } = require('../controllers/uploadController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const upload = require('../middleware/upload');

router.post('/animal/:id/photo', auth, authorize('Admin', 'Vet'), upload.single('file'), uploadAnimalPhoto);
router.post('/health-record/:id/document', auth, authorize('Admin', 'Vet'), upload.single('file'), uploadHealthDocument);
router.get('/:filename', serveFile);

module.exports = router;
