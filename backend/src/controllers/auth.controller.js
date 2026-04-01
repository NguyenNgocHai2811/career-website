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
}

module.exports = new AuthController();
