const express = require('express');
const router = express.Router();
const { logProduction, list, dashboard } = require('../controllers/productionController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.post('/', auth, authorize('Admin', 'Vet', 'Worker'), logProduction);
router.get('/', auth, list);
router.get('/dashboard', auth, dashboard);

module.exports = router;
