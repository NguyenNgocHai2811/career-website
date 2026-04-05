const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', userController.getUsers);
router.post('/', userController.createUser);
router.post('/complete-onboarding', authMiddleware.verifyToken, userController.completeOnboarding);

// Lấy thông tin profile người dùng
router.get('/:userId/profile', userController.getUserProfile);

// sắp xếp mảng
module.exports = router;
