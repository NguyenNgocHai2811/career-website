const express = require('express');
const authController = require('../controllers/auth.controller');

const router = express.Router();

// Route xử lý việc đăng ký tài khoản (POST /v1/auth/register)
router.post('/register', authController.register);

// Route xử lý việc đăng nhập (POST /v1/auth/login)
router.post('/login', authController.login);

module.exports = router;
