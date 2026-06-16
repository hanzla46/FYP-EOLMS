const express = require('express');
const router = express.Router();
const { logInsemination, list, pregnancyCheck, recordCalving } = require('../controllers/breedingController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.post('/', auth, authorize('Admin', 'Vet'), logInsemination);
router.get('/', auth, list);
router.patch('/:id/pregnancy-check', auth, authorize('Admin', 'Vet'), pregnancyCheck);
router.patch('/:id/calving', auth, authorize('Admin', 'Vet'), recordCalving);

module.exports = router;
