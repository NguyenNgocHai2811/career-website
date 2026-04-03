const authService = require('../services/auth.service');

class AuthController {
  /**
   * Controller API đăng ký
   * Xử lý POST /v1/auth/register
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async register(req, res) {
    try {
      // 1. Lấy dữ liệu từ body của request
      const {
        role,
        fullName,
        email,
        password,
        confirmPassword,
        phone,
        dateOfBirth,
        address
      } = req.body;

      // 2. Validate dữ liệu đầu vào (cơ bản)
      if (!email || !password || !fullName || !role) {
        return res.status(400).json({
          status: 'error',
          message: 'Các trường Full Name, Email, Password và Role là bắt buộc.',
        });
      }

      // Kiểm tra định dạng email (cơ bản)
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          status: 'error',
          message: 'Định dạng email không hợp lệ.',
        });
      }

      // Kiểm tra độ dài mật khẩu
      if (password.length < 8) {
        return res.status(400).json({
          status: 'error',
          message: 'Mật khẩu phải có ít nhất 8 ký tự.',
        });
      }

      // Kiểm tra mật khẩu xác nhận
      if (password !== confirmPassword) {
        return res.status(400).json({
          status: 'error',
          message: 'Mật khẩu xác nhận không khớp.',
        });
      }

      // 3. Gọi Service layer để thực hiện business logic
      const result = await authService.registerUser({
        role,
        fullName,
        email,
        password,
        phone,
        dateOfBirth,
        address
      });

      // 4. Trả về kết quả thành công cho Client
      // Chuẩn JSON trả về bao gồm thông tin user và JWT token
      return res.status(201).json({
        status: 'success',
        message: 'Đăng ký tài khoản thành công.',
        data: {
          user: result.user,
          token: result.token
        }
      });

    } catch (error) {
      // 5. Bắt lỗi và trả về response phù hợp
      console.error('[AuthController.register] Error:', error);

      // Xử lý các lỗi từ Service layer (ví dụ: email trùng)
      if (error.message === 'Email đã được sử dụng.') {
        return res.status(409).json({
          status: 'error',
          message: error.message
        });
      }

      // Các lỗi hệ thống khác
      return res.status(500).json({
        status: 'error',
        message: 'Lỗi hệ thống nội bộ. Vui lòng thử lại sau.'
      });
    }
  }

  /**
   * Controller API đăng nhập
   * Xử lý POST /v1/auth/login
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(401).json({
          status: 'error',
          message: 'Email hoặc mật khẩu không chính xác'
        });
      }

      const result = await authService.loginUser(email, password);

      return res.status(200).json({
        status: 'success',
        message: 'Đăng nhập thành công',
        data: {
          user: result.user,
          token: result.token
        }
      });
    } catch (error) {
      console.error('[AuthController.login] Error:', error);

      if (error.message === 'Email hoặc mật khẩu không chính xác') {
        return res.status(401).json({
          status: 'error',
          message: error.message
        });
      }

      return res.status(500).json({
        status: 'error',
        message: 'Lỗi hệ thống nội bộ. Vui lòng thử lại sau.'
      });
    }
  }

  /**
   * Controller API yêu cầu đặt lại mật khẩu
   * Xử lý POST /v1/auth/forgot-password
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          status: 'error',
          message: 'Vui lòng cung cấp email.'
        });
      }

      // Khắc phục lỗi Host Header Poisoning (Vulnerability): Sử dụng biến môi trường thay vì Header
      const originUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      console.log(originUrl);
      await authService.forgotPassword(email, originUrl);

      return res.status(200).json({
        status: 'success',
        message: 'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn.'
      });
    } catch (error) {
      console.error('[AuthController.forgotPassword] Error:', error);

      // Khắc phục User Enumeration: Trả về 200 Success giả kể cả khi tài khoản không tồn tại
      if (error.message === 'Tài khoản không tồn tại.') {
        return res.status(200).json({
          status: 'success',
          message: 'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn.'
        });
      }

      return res.status(500).json({
        status: 'error',
        message: 'Lỗi hệ thống nội bộ. Vui lòng thử lại sau.'
      });
    }
  }

  /**
   * Controller API xác nhận đổi mật khẩu mới
   * Xử lý POST /v1/auth/reset-password
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          status: 'error',
          message: 'Token và mật khẩu mới là bắt buộc.'
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          status: 'error',
          message: 'Mật khẩu phải có ít nhất 8 ký tự.'
        });
      }

      await authService.resetPassword(token, newPassword);

      return res.status(200).json({
        status: 'success',
        message: 'Đặt lại mật khẩu thành công.'
      });
    } catch (error) {
      console.error('[AuthController.resetPassword] Error:', error);

      if (error.message === 'Token không hợp lệ hoặc đã hết hạn.') {
        return res.status(400).json({
          status: 'error',
          message: error.message
        });
      }

      return res.status(500).json({
        status: 'error',
        message: 'Lỗi hệ thống nội bộ. Vui lòng thử lại sau.'
      });
    }
  }
}

module.exports = new AuthController();
