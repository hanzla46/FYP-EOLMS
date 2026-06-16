const express = require('express');
const router = express.Router();
const { register, login, me, listUsers } = require('../controllers/authController');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.post('/register', auth, authorize('Admin'), register);
router.post('/login', login);
router.get('/me', auth, me);
router.get('/users', auth, listUsers);

module.exports = router;
