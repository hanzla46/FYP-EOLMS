const express = require('express');
const router = express.Router();
const { register, list, getById, update, updateStatus } = require('../controllers/animalController');
const { getHealthHistory } = require('../controllers/healthController');
const { getBreedingHistory } = require('../controllers/breedingController');
const { productionStats } = require('../controllers/productionController');
const { animalFinancials } = require('../controllers/financeController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.post('/', auth, authorize('Admin', 'Vet'), register);
router.get('/', auth, list);
router.get('/:id', auth, getById);
router.get('/:id/health-history', auth, getHealthHistory);
router.get('/:id/breeding-history', auth, getBreedingHistory);
router.get('/:id/production-stats', auth, productionStats);
router.get('/:id/financials', auth, authorize('Admin'), animalFinancials);
router.put('/:id', auth, authorize('Admin', 'Vet'), update);
router.patch('/:id/status', auth, authorize('Admin', 'Vet'), updateStatus);

module.exports = router;
