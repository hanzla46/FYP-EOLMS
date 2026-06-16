const express = require('express');
const router = express.Router();
const { register, list, getById, update, updateStatus } = require('../controllers/animalController');
const { getHealthHistory } = require('../controllers/healthController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.post('/', auth, authorize('Admin', 'Vet'), register);
router.get('/', auth, list);
router.get('/:id', auth, getById);
router.get('/:id/health-history', auth, getHealthHistory);
router.put('/:id', auth, authorize('Admin', 'Vet'), update);
router.patch('/:id/status', auth, authorize('Admin', 'Vet'), updateStatus);

module.exports = router;
