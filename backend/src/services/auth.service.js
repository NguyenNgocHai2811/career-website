const authRepository = require('../repositories/auth.repository');
const bcrypt = require('bcryptjs');
const { generateUUID } = require('../utils/uuid');
const jwt = require('jsonwebtoken');

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
      const validRoles = ['CANDIDATE', 'RECRUITER'];
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
  generateToken(userId, role) {
    const payload = {
      userId,
      role
    };

    const secretKey = process.env.JWT_SECRET || 'korra_secret_key_default';
    const options = { expiresIn: '7d' }; // Token hết hạn sau 7 ngày

    return jwt.sign(payload, secretKey, options);
  }
}

module.exports = new AuthService();
