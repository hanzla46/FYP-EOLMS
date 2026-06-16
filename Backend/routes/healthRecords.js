const express = require('express');
const router = express.Router();
const { createRecord, list, getById } = require('../controllers/healthController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.post('/', auth, authorize('Admin', 'Vet'), createRecord);
router.get('/', auth, list);
router.get('/:id', auth, getById);

module.exports = router;
