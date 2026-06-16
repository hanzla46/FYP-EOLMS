const express = require('express');
const router = express.Router();
const { createTransaction, list, summary, animalFinancials } = require('../controllers/financeController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.post('/transactions', auth, authorize('Admin'), createTransaction);
router.get('/transactions', auth, authorize('Admin'), list);
router.get('/summary', auth, authorize('Admin'), summary);

module.exports = router;
