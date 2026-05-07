const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware.verifyToken);

router.get('/recent', chatController.getRecentChats);
router.get('/history/:friendId', chatController.getHistory);

module.exports = router;
