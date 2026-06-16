const express = require('express');
const router = express.Router();
const { logInsemination, list, pregnancyCheck } = require('../controllers/breedingController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.post('/', auth, authorize('Admin', 'Vet'), logInsemination);
router.get('/', auth, list);
router.patch('/:id/pregnancy-check', auth, authorize('Admin', 'Vet'), pregnancyCheck);

module.exports = router;
