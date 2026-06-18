const express = require('express');
const router = express.Router();
const { register, login, me, listUsers, updateUser, toggleStatus } = require('../controllers/authController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.post('/register', auth, authorize('Admin'), register);
router.post('/login', login);
router.get('/me', auth, me);
router.get('/users', auth, listUsers);
router.put('/users/:id', auth, authorize('Admin'), updateUser);
router.patch('/users/:id/status', auth, authorize('Admin'), toggleStatus);

module.exports = router;
