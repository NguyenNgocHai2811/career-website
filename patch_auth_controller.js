const fs = require('fs');
const path = 'backend/src/controllers/auth.controller.js';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('async login(req, res)')) {
  const loginMethod = `
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
}
`;

  content = content.replace(/}\s*module\.exports = new AuthController\(\);/, loginMethod + '\nmodule.exports = new AuthController();');
  fs.writeFileSync(path, content, 'utf8');
}
