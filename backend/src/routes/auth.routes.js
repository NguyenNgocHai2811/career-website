const express = require('express');
const authController = require('../controllers/auth.controller');

const router = express.Router();

// Route xử lý việc đăng ký tài khoản (POST /v1/auth/register)
router.post('/register', authController.register);

// Route xử lý việc đăng nhập (POST /v1/auth/login)
router.post('/login', authController.login);

// Route xử lý yêu cầu quên mật khẩu (POST /v1/auth/forgot-password)
router.post('/forgot-password', authController.forgotPassword);

// Route xử lý việc đặt lại mật khẩu bằng token (POST /v1/auth/reset-password)
router.post('/reset-password', authController.resetPassword);

module.exports = router;
