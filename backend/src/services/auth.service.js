const authRepository = require('../repositories/auth.repository');
const bcrypt = require('bcryptjs');
const { generateUUID } = require('../utils/uuid');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailUtil = require('../utils/email');

class AuthService {
  /**
   * Đăng ký người dùng mới
   * @param {Object} userData
   * @returns {Object} { user, token } nếu thành công
   */
  async registerUser(userData) {
    try {
      // 1. Kiểm tra email đã tồn tại hay chưa
      const emailExists = await authRepository.checkEmailExists(userData.email);
      if (emailExists) {
        throw new Error('Email đã được sử dụng.');
      }

      // 2. Hash mật khẩu bằng bcrypt
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // 3. Chuẩn bị dữ liệu lưu vào DB
      // Mặc định role là CANDIDATE nếu không hợp lệ
      const validRoles = ['CANDIDATE', 'RECRUITER', 'ADMIN'];
      const assignedRole = validRoles.includes(userData.role?.toUpperCase())
        ? userData.role.toUpperCase()
        : 'CANDIDATE';

      const userToCreate = {
        userId: generateUUID(),
        role: assignedRole,
        fullName: userData.fullName,
        email: userData.email,
        password: hashedPassword,
        phone: userData.phone || null,
        dateOfBirth: userData.dateOfBirth || null,
        address: userData.address || null,
        companyName: userData.companyName || null
      };
      // 4. Lưu vào Database thông qua Repository layer
      const createdUser = await authRepository.createUser(userToCreate);

      if (!createdUser) {
        throw new Error('Không thể tạo người dùng. Vui lòng thử lại sau.');
      }

      // 5. Tạo JWT Token
      const token = this.generateToken(createdUser.userId, createdUser.role);

      return { user: createdUser, token };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Sinh ra JWT token
   * @param {string} userId
   * @param {string} role
   * @returns {string} JWT
   */
  generateToken(userId, role, expiresIn = '7d') {
    const payload = {
      userId,
      role
    };

    const secretKey = process.env.JWT_SECRET || 'korra_secret_key_default';
    const options = { expiresIn }; // Token hết hạn sau 7 ngày

    return jwt.sign(payload, secretKey, options);
  }

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

  /**
   * Xử lý yêu cầu quên mật khẩu
   * @param {string} email
   * @param {string} originUrl URL gốc của frontend (để tạo link)
   */
  async forgotPassword(email, originUrl = 'http://localhost:5173') {
    try {
      // 1. Kiểm tra user tồn tại
      const user = await authRepository.getUserByEmail(email);
      if (!user) {
        // Tránh tiết lộ email có tồn tại hay không vì lý do bảo mật,
        // trả về thành công giả (hoặc ném lỗi tùy logic nghiệp vụ).
        // Ở đây ném lỗi để controller xử lý.
        throw new Error('Tài khoản không tồn tại.');
      }

      // 2. Tạo reset token ngẫu nhiên
      const resetToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiry = Date.now() + 15 * 60 * 1000; // 15 phút

      // 3. Lưu token vào DB
      await authRepository.saveResetToken(email, resetToken, tokenExpiry);

      // 4. Tạo link reset mật khẩu (trỏ về Frontend)
      const resetUrl = `${originUrl}/reset-password?token=${resetToken}`;

      // 5. Gửi email
      await emailUtil.sendResetPasswordEmail(email, resetUrl);

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Đặt lại mật khẩu mới
   * @param {string} token
   * @param {string} newPassword
   */
  async resetPassword(token, newPassword) {
    try {
      // 1. Tìm user bằng token
      const user = await authRepository.getUserByResetToken(token);

      if (!user) {
        throw new Error('Token không hợp lệ hoặc đã hết hạn.');
      }

      // 2. Băm mật khẩu mới
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // 3. Cập nhật vào DB và xóa token
      await authRepository.updatePasswordAndClearToken(user.userId, hashedPassword);

      return true;
    } catch (error) {
      throw error;
    }
  }

}

module.exports = new AuthService();
