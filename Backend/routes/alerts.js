const express = require('express');
const router = express.Router();
const { list, unreadCount, markRead } = require('../controllers/alertController');
const auth = require('../middleware/auth');

router.get('/', auth, list);
router.get('/unread-count', auth, unreadCount);
router.patch('/:id/read', auth, markRead);

module.exports = router;
