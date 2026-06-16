const express = require('express');
const router = express.Router();
const { create, list } = require('../controllers/vaccinationScheduleController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.post('/', auth, authorize('Admin', 'Vet'), create);
router.get('/', auth, list);

module.exports = router;
