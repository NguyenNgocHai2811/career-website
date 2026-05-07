const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware.verifyToken);

router.get('/', notificationController.getNotifications);
router.post('/mark-read', notificationController.markAsRead);

module.exports = router;
