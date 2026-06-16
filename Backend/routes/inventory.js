const express = require('express');
const router = express.Router();
const { addItem, list, getById, update, adjustStock } = require('../controllers/inventoryController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.post('/', auth, authorize('Admin', 'Vet'), addItem);
router.get('/', auth, list);
router.get('/:id', auth, getById);
router.put('/:id', auth, authorize('Admin', 'Vet'), update);
router.patch('/:id/stock', auth, authorize('Admin', 'Vet'), adjustStock);

module.exports = router;
