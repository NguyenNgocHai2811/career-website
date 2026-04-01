const { driver } = require('../config/neo4j');

class AuthRepository {
  /**
   * Tạo user mới trong database. Tự động thêm label dựa vào role.
   * @param {Object} userData
   * @returns {Object|null} Thông tin user vừa tạo, không bao gồm password
   */
  async createUser(userData) {
    const session = driver.session();
    try {
      // Chọn label bổ sung dựa vào role (CANDIDATE hoặc RECRUITER)
      // Mặc định tạo label User và label tương ứng với role.
      const additionalLabel = userData.role === 'RECRUITER' ? 'Recruiter' : 'Candidate';

      const query = `
        CREATE (u:User:${additionalLabel} {
          userId: $userId,
          role: $role,
          fullName: $fullName,
          email: $email,
          password: $password,
          phone: $phone,
          dateOfBirth: $dateOfBirth,
          address: $address,
          createdAt: datetime()
        })
        RETURN u {
          .userId,
          .role,
          .fullName,
          .email,
          .phone,
          .dateOfBirth,
          .address,
          .createdAt
        } AS user
      `;

      const result = await session.executeWrite(tx => tx.run(query, userData));

      if (result.records.length === 0) {
        return null;
      }

      return result.records[0].get('user');
    } finally {
      await session.close();
    }
  }

  /**
   * Tìm kiếm user theo email để kiểm tra xem đã tồn tại chưa
   * @param {string} email
   * @returns {boolean} true nếu email đã tồn tại
   */
  async checkEmailExists(email) {
    const session = driver.session();
    try {
      const query = `
        MATCH (u:User {email: $email})
        RETURN u.userId AS userId
        LIMIT 1
      `;
      const result = await session.executeRead(tx => tx.run(query, { email }));
      return result.records.length > 0;
    } finally {
      await session.close();
    }
  }
}

module.exports = new AuthRepository();
