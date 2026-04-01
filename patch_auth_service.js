const fs = require('fs');
const path = 'backend/src/services/auth.service.js';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('async loginUser(email, password)')) {
  // Add loginUser method
  const loginMethod = `
  /**
   * Đăng nhập người dùng
   * @param {string} email
   * @param {string} password
   * @returns {Object} { user, token } nếu thành công
   */
  async loginUser(email, password) {
    try {
      // 1. Lấy thông tin user theo email
      const user = await authRepository.getUserByEmail(email);

      if (!user) {
        throw new Error('Email hoặc mật khẩu không chính xác');
      }

      // 2. Kiểm tra mật khẩu
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new Error('Email hoặc mật khẩu không chính xác');
      }

      // 3. Tạo token (thời hạn 1d theo yêu cầu)
      const token = this.generateToken(user.userId, user.role, '1d');

      // 4. Chuẩn bị dữ liệu user trả về (không bao gồm password)
      const { password: _, ...userWithoutPassword } = user;

      return { user: userWithoutPassword, token };
    } catch (error) {
      throw error;
    }
  }
`;

  content = content.replace(/generateToken\(userId, role\) {/g, 'generateToken(userId, role, expiresIn = \'7d\') {');
  content = content.replace(/const options = { expiresIn: '7d' };/g, 'const options = { expiresIn };');
  content = content.replace(/}\s*module\.exports = new AuthService\(\);/, loginMethod + '\n}\n\nmodule.exports = new AuthService();');

  fs.writeFileSync(path, content, 'utf8');
}
